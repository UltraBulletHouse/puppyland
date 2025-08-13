import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

interface AlertNotifyProps {
  message: string;
  variant?: string;
  icon?: string;
  duration?: number;
}

const ALERT_DURATION = 3000; // Default duration for alerts

export const alertNotify = ({
  message = '',
  variant = 'default',
  icon = 'info-circle',
  duration = Infinity,
}: AlertNotifyProps) => {
  const alert = Object.assign(document.createElement('sl-alert'), {
    variant,
    closable: true,
    duration: duration,
    innerHTML: `
      <sl-icon name="${icon}" slot="icon"></sl-icon>
      ${message}
    `,
  });

  document.body.append(alert);
  return alert.toast();
};

export const alertNotifySuccess = (message: string, options?: Partial<AlertNotifyProps>) =>
  alertNotify({
    variant: 'success',
    icon: 'check2-circle',
    duration: ALERT_DURATION,
    ...options,
    message,
  });

export const alertNotifyPrimary = (message: string, options?: Partial<AlertNotifyProps>) =>
  alertNotify({
    variant: 'primary',
    icon: 'info-circle',
    duration: ALERT_DURATION,
    ...options,
    message,
  });

export const alertNotifyDanger = (message: string, options?: Partial<AlertNotifyProps>) =>
  alertNotify({
    variant: 'danger',
    icon: 'exclamation-octagon',
    duration: ALERT_DURATION,
    ...options,
    message,
  });

export const alertNotifyWarning = (message: string, options?: Partial<AlertNotifyProps>) =>
  alertNotify({
    variant: 'warning',
    icon: 'exclamation-triangle',
    duration: ALERT_DURATION,
    ...options,
    message,
  });

export const showSuccessModal = (title: string, message: string) => {
  const dialog = Object.assign(document.createElement('sl-dialog'), {
    label: title,
    innerHTML: `
      <div style="text-align: center; padding: 16px;">
        <sl-icon name="check-circle" style="font-size: 48px; color: var(--sl-color-success-500);"></sl-icon>
        <p style="font-size: 16px; margin-top: 16px;">${message}</p>
      </div>
      <sl-button slot="footer" variant="primary">Close</sl-button>
    `,
  });

  document.body.append(dialog);
  dialog.show();

  dialog.addEventListener('sl-hide', () => {
    dialog.remove();
  });

  const closeButton = dialog.querySelector('sl-button[slot="footer"]');
  if (closeButton) {
    closeButton.addEventListener('click', () => dialog.hide());
  }
};
