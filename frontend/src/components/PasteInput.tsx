import type { ChangeEvent } from "react";

type PasteInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function PasteInput({
  value,
  onChange,
  placeholder
}: PasteInputProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      className="paste-input"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={8}
    />
  );
}
