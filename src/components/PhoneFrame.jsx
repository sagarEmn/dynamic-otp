// One fixed phone-sized canvas. Gray page, centered white rounded card
// (~410px wide). Every screen renders inside this via <Outlet/>.
// See documentation/design-system.md > UI Frame & Layout.

import { Outlet } from "react-router-dom";

export default function PhoneFrame() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-[410px] min-h-[844px] bg-esewa-surface rounded-3xl shadow-popup overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
