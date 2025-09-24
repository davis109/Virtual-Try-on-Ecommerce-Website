import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(motion.div)`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  cursor: pointer;
  
  .accent {
    color: #fbbf24;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(motion.a)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const StatusIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.online ? '#10b981' : '#f43f5e'};
    animation: ${props => props.online ? 'pulse 2s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = ({ onlineStatus = true, onLogoClick, onMenuToggle }) => {
  return (
    <HeaderContainer>
      <Nav>
        <Logo
          onClick={onLogoClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          VITR<span className="accent">Z</span>
        </Logo>
        
        <NavLinks>
          <NavLink
            href="#home"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Home
          </NavLink>
          <NavLink
            href="#tryon"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Try On
          </NavLink>
          <NavLink
            href="#gallery"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            Gallery
          </NavLink>
          <NavLink
            href="#about"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            About
          </NavLink>
        </NavLinks>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StatusIndicator
            online={onlineStatus}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="status-dot" />
            <span>{onlineStatus ? 'Online' : 'Offline'}</span>
          </StatusIndicator>
          
          <MobileMenuButton
            onClick={onMenuToggle}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-bars" />
          </MobileMenuButton>
        </div>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;