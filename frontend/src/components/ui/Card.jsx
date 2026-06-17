import React from 'react';

export default function Card({ children, className = '', as: Tag = 'div', ...rest }) {

  const hasCustomBg = /\bbg-/.test(className);

  return (
    <Tag
      className={`rounded-card border border-line p-5 shadow-sm ${hasCustomBg ? '' : 'bg-white'} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}