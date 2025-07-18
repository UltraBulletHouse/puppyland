import '@shoelace-style/shoelace/dist/components/alert/alert.js';

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
