// No React import needed with modern JSX transform
import '../fonts.css';

const FontPreviewPage = () => {
  const fontFamilies = [
    'Baloo',
    'Baloo Bhai',
    'Baloo Bhaijaan',
    'Baloo Bhaina',
    'Baloo Chettan',
    'Baloo Da',
    'Baloo Paaji',
    'Baloo Tamma',
    'Baloo Tammudu',
    'Baloo Thambi'
  ];

  const sampleText = {
    heading1: 'The quick brown fox jumps over the lazy dog',
    heading2: 'Pack my box with five dozen liquor jugs',
    heading3: 'How vexingly quick daft zebras jump',
    heading4: 'ORIGINAL SOURCE NATURAL MEDICINE THE QUICK BROWN FOX',
    paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vulputate nunc vel augue vehicula, ac tincidunt nulla dignissim. Fusce eget urna vel eros lacinia convallis ut at elit. Ut facilisis metus sit amet purus fermentum, a eleifend massa pellentesque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus efficitur nibh in tellus semper, eu efficitur justo sagittis.'
  };

  return (
    <div className="pt-36 pb-20 px-6 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Baloo Font Family Preview</h1>
      <p className="text-lg mb-10 text-center">
        A preview of all Baloo font variants with sample headings and paragraphs
      </p>

      <div className="grid gap-16">
        {fontFamilies.map((fontFamily) => (
          <div key={fontFamily} className="font-preview-card bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#028282] border-b pb-2">
              {fontFamily}
            </h2>

            <div className="space-y-6" style={{ fontFamily: fontFamily }}>

                              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Heading 4 (36px)</h3>
                <h1 className="text-5xl">{sampleText.heading4}</h1>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Heading 1 (36px)</h3>
                <h1 className="text-4xl">{sampleText.heading1}</h1>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Heading 2 (28px)</h3>
                <h2 className="text-3xl">{sampleText.heading2}</h2>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Heading 3 (20px)</h3>
                <h3 className="text-xl">{sampleText.heading3}</h3>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Paragraph (16px)</h3>
                <p className="text-base">{sampleText.paragraph}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Alphabet</h3>
                <p className="text-lg">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-lg">abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-lg">1234567890</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontPreviewPage;
