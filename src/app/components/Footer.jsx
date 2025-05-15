export default function Footer() {
  return (
    <footer className="py-4 bg-[var(--tw-subbackground)] text-[var(--tw-text)]">
      <div className="container mx-auto px-4 flex justify-between item-center">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-[var(--tw-focus)]">TripWeaver</h3>
          <p>Crafting unforgettable travel experiences.</p>
        </div>
        <p className="flex items-end">
          © {new Date().getFullYear()} TripWeaver. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
