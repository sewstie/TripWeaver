export default function Footer() {
  return (
    <footer className="py-6 bg-[var(--tw-subbackground)] text-[var(--tw-text)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col text-center sm:text-left">
            <h3 className="text-xl font-bold mb-2 text-[var(--tw-focus)]">
              TripWeaver
            </h3>
            <p className="text-sm sm:text-base">
              Crafting unforgettable travel experiences.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 text-center sm:text-right text-sm">
            <p>© {new Date().getFullYear()} TripWeaver. All rights reserved.</p>
            <div className="mt-2 flex items-center justify-center sm:justify-end gap-4">
              <a href="/privacy" className="hover:text-[var(--tw-focus)]">
                Privacy
              </a>
              <a href="/terms" className="hover:text-[var(--tw-focus)]">
                Terms
              </a>
              <a href="/contacts" className="hover:text-[var(--tw-focus)]">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
