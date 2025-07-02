type ClassValue = string | undefined | null | false;

export function classNames(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

// Usage example:
// const btnClass = classNames('btn', isActive && 'active', isDisabled && 'disabled');
