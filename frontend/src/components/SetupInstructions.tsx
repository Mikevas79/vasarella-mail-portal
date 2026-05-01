export function SetupInstructions() {
  return (
    <div className="setup-card">
      <h3>Email Setup</h3>

      <div className="setup-grid">

        <div className="setup-item">
          <h4>📱 iPhone / iPad</h4>
          <ol>
            <li>Tap “Download iPhone Setup Profile”</li>
            <li>Tap Allow</li>
            <li>Open Settings</li>
            <li>Go to VPN & Device Management</li>
            <li>Select “Vasarella Mail Setup”</li>
            <li>Tap Install</li>
            <li>Enter your mailbox password</li>
          </ol>
        </div>

        <div className="setup-item">
          <h4>💻 Outlook</h4>
          <ol>
            <li>Open Outlook</li>
            <li>Add Account</li>
            <li>Enter your email + password only</li>
            <li>Outlook should configure automatically</li>
          </ol>
        </div>

        <div className="setup-item">
          <h4>⚡ Thunderbird</h4>
          <ol>
            <li>Open Thunderbird</li>
            <li>Enter your email + password</li>
            <li>Thunderbird should configure automatically</li>
          </ol>
        </div>

        <div className="setup-item">
          <h4>📧 Gmail App</h4>
          <ol>
            <li>Add Account</li>
            <li>Select Other (IMAP)</li>
            <li>Use the settings below</li>
          </ol>
        </div>

      </div>

      <div className="manual-settings">
        <h4>🔧 Manual IMAP / SMTP Settings</h4>

        <div className="settings-grid">
          <div>
            <strong>Incoming (IMAP)</strong>
            <p>Server: mail.vasarella.com</p>
            <p>Port: 993</p>
            <p>Security: SSL/TLS</p>
          </div>

          <div>
            <strong>Outgoing (SMTP)</strong>
            <p>Server: mail.vasarella.com</p>
            <p>Port: 587</p>
            <p>Security: STARTTLS</p>
          </div>
        </div>

        <p>
          Username is always your full email address.
        </p>
      </div>
    </div>
  );
}
