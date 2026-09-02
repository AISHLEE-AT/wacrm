const fs = require('fs');
const file = 'D:/w/apps/web/src/app/(dashboard)/rento/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change RENTAL_ITEMS from a static const to a state variable.
// I will just replace the RENTAL_ITEMS array entirely.
content = content.replace(
  /const RENTAL_ITEMS: RentalItem\[\] = \[[\s\S]*?\];/,
  `// Rental items are now fetched from OCI Backend`
);

// Add useEffect and state for machines
content = content.replace(
  /export default function RentOPage\(\) \{/,
  `export default function RentOPage() {
  const [machines, setMachines] = useState<any[]>([]);
  React.useEffect(() => {
    fetch('http://152.67.7.216:8080/api/rento/machinery')
      .then(res => res.json())
      .then(data => setMachines(data))
      .catch(err => console.error(err));
  }, []);
`
);

// Replace filtered logic
content = content.replace(
  /const filtered = RENTAL_ITEMS\.filter\(\(m\) => \{/,
  `const filtered = machines.filter((m: any) => {`
);

// In the filtered logic, replace item.desc with item.specifications
content = content.replace(
  /m\.desc\.toLowerCase\(\)\.includes/g,
  `(m.specifications || '').toLowerCase().includes`
);

// Replace handleBookWhatsApp with API call
content = content.replace(
  /const handleBookWhatsApp = \(item: RentalItem\) => \{[\s\S]*?setSelectedItem\(null\);\n  \};/,
  `const handleBookWhatsApp = async (item: any) => {
    try {
      const res = await fetch('http://152.67.7.216:8080/api/rento/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machinery_id: item.id,
          customer_name: 'Customer',
          customer_phone: '9999999999',
          booking_location: bookingLocation || 'Unknown Location',
          booking_date: bookingDate
        })
      });
      if (res.ok) {
        alert('Booking request sent successfully to the operator via WhatsApp!');
      } else {
        alert('Failed to send booking request.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
    setSelectedItem(null);
  };`
);

// Update map render item types
content = content.replace(
  /item\.tamilName/g,
  `item.tamil_name`
);

content = content.replace(
  /item\.rate/g,
  `'₹' + item.rate`
);


fs.writeFileSync(file, content);
console.log('RentO page updated successfully!');
