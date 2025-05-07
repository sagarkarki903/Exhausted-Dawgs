import { CalendarPage } from './CalendarPage'


export const MarshalDash = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
    {/* Dashboard Header */}
    <div className="w-full flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Marshal Dashboard</h1>
      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
        Log Out
      </button>
    </div>

    {/* Calendar Page (Reusable Component) */}
    <CalendarPage />
  </div>
  )
}
