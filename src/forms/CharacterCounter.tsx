/** "0 of 500 characters" under a textarea. Pair with `maxLength` on the textarea. */
export function CharacterCounter({ length, max }: { length: number; max: number }) {
  return (
    <div className="counter">
      {length} of {max} characters
    </div>
  );
}
