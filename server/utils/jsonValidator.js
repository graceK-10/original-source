import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to the CSV and JSON files
const CSV_FILE_PATH  = path.join(__dirname, '..', 'data', 'pnumbers.csv');
const JSON_FILE_PATH = path.join(__dirname, '..', 'data', 'pnumbers.json');

// In-memory cache for quick validation
let userCache = new Map();

/**
 * Parse CSV file and return array of records
 * @returns {Array} Array of objects representing CSV rows
 */
const parseCSV = () => {
  try {
    // Check if file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`CSV file not found at ${CSV_FILE_PATH}`);
      return [];
    }

    // Read and parse CSV file
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    return records;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    return [];
  }
};

/**
 * Convert CSV data to JSON and save to file
 * @returns {Array} The converted records
 */
const convertCsvToJson = () => {
  try {
    const records = parseCSV();
    
    if (records.length === 0) {
      console.warn('No records found in CSV file');
      return [];
    }

    // Ensure data directory exists
    const dataDir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write to JSON file
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(records, null, 2));
    console.log(`Converted CSV to JSON: ${records.length} records`);
    
    // Update in-memory cache
    updateCache(records);
    
    return records;
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    return [];
  }
};

/**
 * Update the in-memory cache with user records
 * @param {Array} records - Array of user records
 */
const updateCache = (records) => {
  // Clear existing cache
  userCache.clear();
  
  // Add each record to cache
  records.forEach(record => {
    const pNumber = record['P Number'];
    if (pNumber) {
      // Parse expiry date
      let parsedExpiryDate;
      const expiryDate = record['Expiry Date'];
      
      if (expiryDate && typeof expiryDate === 'string') {
        // Check if the date is in DD/MM/YYYY format
        const dateParts = expiryDate.split('/');
        if (dateParts.length === 3) {
          // Parse as DD/MM/YYYY
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed in JS
          const year = parseInt(dateParts[2], 10);
          parsedExpiryDate = new Date(year, month, day);
        } else {
          // Try standard date parsing as fallback
          parsedExpiryDate = new Date(expiryDate);
        }
      } else {
        // If not a string or undefined, use current date
        parsedExpiryDate = new Date();
      }
      
      // Add to cache
      userCache.set(pNumber, {
        name: record['Name and Surname'],
        expiryDate: parsedExpiryDate,
        email: record['Email'],
        phone: record['Tel No'],
        prescriber: record['Prescriber']
      });
    }
  });
};

/**
 * Get user records from JSON file or create it if it doesn't exist
 * @returns {Array} Array of user records
 */
const getUserRecords = () => {
  try {
    // If JSON file doesn't exist, create it from CSV
    if (!fs.existsSync(JSON_FILE_PATH)) {
      return convertCsvToJson();
    }
    
    // Read JSON file
    const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const records = JSON.parse(fileContent);
    
    // Update cache if it's empty
    if (userCache.size === 0) {
      updateCache(records);
    }
    
    return records;
  } catch (error) {
    console.error('Error reading JSON file:', error);
    // Try to recover by converting from CSV
    return convertCsvToJson();
  }
};

/**
 * Initialize the file watcher and load initial data
 */
const initializeValidator = () => {
  try {
    // Load initial data
    getUserRecords();

    // Set up file watcher for CSV
    const watcher = chokidar.watch(CSV_FILE_PATH, {
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    // Watch for file changes
    watcher
      .on('add', () => convertCsvToJson())
      .on('change', () => convertCsvToJson())
      .on('unlink', () => {
        console.log('CSV file deleted, waiting for new file...');
        userCache.clear();
      });

    console.log(`Watching for changes to ${CSV_FILE_PATH}`);
  } catch (error) {
    console.error('Error initializing validator:', error);
  }
};

/**
 * Validate a P number against the data
 * @param {string} pNumber - The P number to validate
 * @returns {Object} Validation result
 */
export const validatePNumber = (pNumber) => {
  try {
    // Try to find the P number in the cache first
    if (userCache.has(pNumber)) {
      const cacheEntry = userCache.get(pNumber);
      
      // Check if the P number is expired
      const now = new Date();
      if (cacheEntry.expiryDate < now) {
        return { 
          valid: false, 
          message: 'P Number has expired',
          expiryDate: cacheEntry.expiryDate
        };
      }
      
      return { 
        valid: true, 
        expiryDate: cacheEntry.expiryDate,
        name: cacheEntry.name,
        email: cacheEntry.email,         // <-- add
        phone: cacheEntry.phone  
      };
    }
    
    // If not in memory cache, check JSON file
    const records = getUserRecords();
    const user = records.find(r => r['P Number'] === pNumber);
    
    if (!user) {
      return { valid: false, message: 'P Number not found in our records' };
    }
    
    // Parse expiry date
    let parsedExpiryDate;
    const expiryDate = user['Expiry Date'];
    
    if (expiryDate && typeof expiryDate === 'string') {
      const dateParts = expiryDate.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        parsedExpiryDate = new Date(year, month, day);
      } else {
        parsedExpiryDate = new Date(expiryDate);
      }
    } else {
      parsedExpiryDate = new Date();
    }
    
    // Update cache
    userCache.set(pNumber, {
      name: user['Name and Surname'],
      expiryDate: parsedExpiryDate,
      email: user['Email'],
      phone: user['Tel No'], 
      prescriber: user['Prescriber']
    });
    
    // Check if expired
    const now = new Date();
    if (parsedExpiryDate < now) {
      return { 
        valid: false, 
        message: 'P Number has expired',
        expiryDate: parsedExpiryDate
      };
    }
    
    return { 
      valid: true, 
      expiryDate: parsedExpiryDate,
      name: user['Name and Surname']
    };
  } catch (error) {
    console.error('Error validating P number:', error);
    throw error;
  }
};

/**
 * Get user details by name and P number
 * @param {string} name - User's name
 * @param {string} pNumber - User's P number
 * @returns {Object|null} User details or null if not found
 */
export const getUserByNameAndPNumber = (name, pNumber) => {
  try {
    console.log(`Looking for user with name: ${name} and P number: ${pNumber}`);
    
    // Get all records
    const records = getUserRecords();
    console.log(`Total records: ${records.length}`);
    
    // Find user with case-insensitive name matching
    const user = records.find(r => 
      r['P Number'] === pNumber && 
      r['Name and Surname'].toLowerCase().includes(name.toLowerCase())
    );
    
    if (!user) {
      console.log('User not found');
      return null;
    }
    
    console.log(`User found: ${user['Name and Surname']}, expiry date: ${user['Expiry Date']}`);
    
    // Parse expiry date
    let parsedExpiryDate;
    const expiryDate = user['Expiry Date'];
    
    if (expiryDate && typeof expiryDate === 'string') {
      const dateParts = expiryDate.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        parsedExpiryDate = new Date(year, month, day);
      } else {
        parsedExpiryDate = new Date(expiryDate);
      }
    } else {
      parsedExpiryDate = new Date();
    }
    
    // Check if expired
    const now = new Date();
    if (parsedExpiryDate < now) {
      return { 
        valid: false, 
        message: 'P Number has expired',
        user: {
          ...user,
          expiryDate: parsedExpiryDate,
          name: user['Name and Surname'],
          pNumber: user['P Number'],
          _id: user['P Number'] // Use P Number as ID
        }
      };
    }
    
    return { 
      valid: true,
      user: {
        ...user,
        expiryDate: parsedExpiryDate,
        name: user['Name and Surname'],
        pNumber: user['P Number'],
        email: user['Email'],      // <-- include
        phone: user['Tel No'],     // <-- include
        _id: user['P Number'] // Use P Number as ID
      }
    };
  } catch (error) {
    console.error('Error getting user by name and P number:', error);
    throw error;
  }
};

// @param {string} pNumber - The P number to look up
//  @returns {Object|null} User details or null if not found
 
export const getUserByPNumber = (pNumber) => {
  const records = getUserRecords();
  const user = records.find(r => r['P Number'] === pNumber);
  if (!user) return null;

  // Parse expiry date
  let parsedExpiryDate;
  const expiryDate = user['Expiry Date'];
  if (expiryDate && typeof expiryDate === "string") {
    const dateParts = expiryDate.split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      parsedExpiryDate = new Date(year, month, day);
    } else {
      parsedExpiryDate = new Date(expiryDate);
    }
  } else {
    parsedExpiryDate = new Date();
  }

  return {
    name: user["Name and Surname"],
    pNumber: user["P Number"],
    email: user["Email"],     // <-- add email
    phone: user["Tel No"],    // <-- add phone
    expiryDate: parsedExpiryDate,
    _id: user["P Number"]
  };
};

/**
 * Reload data from CSV file
 */
export const reloadData = () => {
  return convertCsvToJson();
};

// Initialize the validator
initializeValidator();

export default {
  validatePNumber,
  getUserByNameAndPNumber,
  getUserByPNumber,  
  reloadData
};
