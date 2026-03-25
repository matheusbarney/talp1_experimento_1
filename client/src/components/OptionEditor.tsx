import type { Option } from "../types";

type OptionEditorProps = {
  option: Option;
  index: number;
  disableRemove: boolean;
  onChange: (index: number, changes: Partial<Option>) => void;
  onRemove: (index: number) => void;
};

export function OptionEditor({
  option,
  index,
  disableRemove,
  onChange,
  onRemove
}: OptionEditorProps) {
  return (
    <article className="option-card">
      <label>
        Description
        <input
          type="text"
          value={option.description}
          onChange={(event) => onChange(index, { description: event.target.value })}
          placeholder={`Option ${index + 1}`}
        />
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={option.isCorrect}
          onChange={(event) => onChange(index, { isCorrect: event.target.checked })}
        />
        <span>Correct answer</span>
      </label>

      <button className="danger" type="button" onClick={() => onRemove(index)} disabled={disableRemove}>
        Remove
      </button>
    </article>
  );
}
