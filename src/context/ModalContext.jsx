// src/context/ModalContext.js
import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ contactOpen, setContactOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useModal = () => useContext(ModalContext);
