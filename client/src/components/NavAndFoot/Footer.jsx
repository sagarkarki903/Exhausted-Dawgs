import React from 'react'

export const Footer = () => {
  return (
        <footer className="py-6 border-t bg-white shadow-md">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-2 text-center">
                <p className="text-sm text-gray-500">© 2024 Underdogs. All rights reserved.</p>
                <div className="flex gap-4">
                <a href="/privacy" className="text-sm text-gray-500 hover:text-[#8B2232]">Privacy Policy</a>
                <a href="/terms" className="text-sm text-gray-500 hover:text-[#8B2232]">Terms of Service</a>
    </div>
  </div>
</footer>

  )
}
