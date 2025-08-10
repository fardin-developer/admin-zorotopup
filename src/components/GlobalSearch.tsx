import React, { useState } from 'react';
import { Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      setSearchQuery(''); // Clear the input after search
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Input.Search
        placeholder={isMobile ? "Search..." : "Search users, orders, transactions..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onSearch={handleSearch}
        style={{
          width: isMobile ? '100%' : 400,
          maxWidth: isMobile ? '250px' : '400px',
        }}
        size={isMobile ? "small" : "middle"}
        allowClear
      />
    </div>
  );
};

export default GlobalSearch;