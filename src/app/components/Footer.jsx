export default function Footer() {
  return (
    <footer className="bg-gray-800 py-4 mt-auto">
      <div className="container mx-auto px-4 flex justify-between item-center">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-4">TripWeaver</h3>
          <p>Crafting unforgettable travel experiences.</p>
        </div>
        <p className="flex items-end">
          © {new Date().getFullYear()} TripWeaver. All rights reserved.
        </p>
        <div className="flex flex-col justify-end space-y-1">
          <h3 className="text-lg text-right">Connect With Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="link">
              Twitter
            </a>
            <a href="#" className="link">
              Facebook
            </a>
            <a href="#" className="link">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
