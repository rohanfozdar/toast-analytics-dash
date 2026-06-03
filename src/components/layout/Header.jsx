import DateRangePicker from './DateRangePicker';

export default function Header() {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h1>Toast Analytics Dashboard</h1>
      <DateRangePicker />
    </header>
  );
}
