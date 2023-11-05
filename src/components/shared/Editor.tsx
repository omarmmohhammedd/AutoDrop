import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Editor({
  onChange,
  value
}: {
  value: string | undefined;
  onChange: (
    value: string | undefined,
    delta: any,
    source: any,
    editor: ReactQuill.UnprivilegedEditor
  ) => void;
}) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
    />
  );
}
