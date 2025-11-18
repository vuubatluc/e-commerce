import React from 'react';
import './Table.css';

function Table({ children, className = '', ...props }) {
  return (
    <div className="table-container">
      <table className={`table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }) {
  return <thead className="table-head">{children}</thead>;
}

function TableBody({ children }) {
  return <tbody className="table-body">{children}</tbody>;
}

function TableRow({ children, onClick, className = '' }) {
  return (
    <tr 
      className={`table-row ${onClick ? 'table-row-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

function TableHeader({ children, className = '', ...props }) {
  return (
    <th className={`table-header ${className}`} {...props}>
      {children}
    </th>
  );
}

function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`table-cell ${className}`} {...props}>
      {children}
    </td>
  );
}

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;
