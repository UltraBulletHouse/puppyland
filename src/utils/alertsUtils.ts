import '@shoelace-style/shoelace/dist/components/alert/alert.js';

interface AlertNotifyProps {
  message: string;
  variant?: string;
  icon?: string;
  duration?: number;
}

function escapeHtml(html: string) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

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
      ${escapeHtml(message)}
    `,
  });

  document.body.append(alert);
  return alert.toast();
};

export const alertNotifySuccess = (message: string) =>
  alertNotify({
    message,
    variant: 'success',
    icon: 'check2-circle',
    duration: 4000,
  });

export const alertNotifyPrimary = (message: string) =>
  alertNotify({
    message,
    variant: 'primary',
    icon: 'info-circle',
    duration: 4000,
  });

export const alertNotifyDanger = (message: string) =>
  alertNotify({
    message,
    variant: 'danger',
    icon: 'exclamation-octagon',
    duration: 4000,
  });

export const alertNotifyWarning = (message: string) =>
  alertNotify({
    message,
    variant: 'warning',
    icon: 'exclamation-triangle',
    duration: 4000,
  });
