/**
 * Small spinner for action buttons, e.g.
 * <button disabled={isPending}>{isPending && <ButtonSpinner />}Save</button>
 * Uses the button's text colour.
 */
const ButtonSpinner = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden
    className={`inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
  />
);

export default ButtonSpinner;
