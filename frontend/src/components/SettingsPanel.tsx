import type { CadenceProfile } from "../domain/types";

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  cadenceProfile: CadenceProfile;
  onCadenceChange: (profile: CadenceProfile) => void;
};

export default function SettingsPanel({
  open,
  onClose,
  cadenceProfile,
  onCadenceChange
}: SettingsPanelProps) {
  return (
    <div className={`settings-panel ${open ? "open" : ""}`}>
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="settings-body">
        <div className="setting-row">
          <label htmlFor="cadence">Cadence profile</label>
          <select
            id="cadence"
            value={cadenceProfile}
            onChange={(event) =>
              onCadenceChange(event.target.value as CadenceProfile)
            }
          >
            <option value="normal">Normal</option>
            <option value="strong">Strong</option>
          </select>
        </div>
        <div className="setting-note">WPM range: 250 to 1200</div>
      </div>
    </div>
  );
}
