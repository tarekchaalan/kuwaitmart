import React from "react";
import clickLogo from "../assets/click.png";
import knetLogo from "../assets/knet.png";
import cardLogo from "../assets/creditcard.png";

export default function Footer() {
  return (
    <footer className="border-top border-slate-200 py-10 mt-10">
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-600">
        <div>
          <div className="font-semibold text-slate-800 mb-2">KuwaitMart</div>
          <p className="leading-relaxed">
            Your one-stop shop for food in Kuwait.
          </p>
        </div>
        <div className="sm:col-start-2 sm:col-end-3 flex flex-col items-center">
          <div className="font-semibold text-slate-800 mb-2">Support</div>
          <ul className="space-y-1">
            <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
            <li><a href="mailto:info@g7tc.com" className="hover:underline">info@g7tc.com</a></li>
            <li><a href="tel:+96522024111" className="hover:underline">+965 22024111</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-800 mb-2">Payments</div>
          <div className="flex items-center gap-3">
            <img src={clickLogo} alt="CLICK" className="h-8 w-auto" />
            <img src={cardLogo} alt="Credit Card" className="h-8 w-auto" />
            <img src={knetLogo} alt="KNET" className="h-8 w-auto" />
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} KuwaitMart
      </div>
    </footer>
  );
}
