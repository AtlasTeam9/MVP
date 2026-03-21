export function DeviceInfoOverlay({ device, onClose }) {
    // Implementa + render(): JSX.Element e + handleClose()
    return (
        <div className="overlay">
            <h3>Device Info: {device?.name}</h3>
            <button onClick={onClose}>Close</button>
        </div>
    )
}
