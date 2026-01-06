export function Footer() {
  return (
    <footer
      className="px-5 md:px-10 lg:px-20 py-10 md:py-12 lg:py-16"
      style={{
        backgroundColor: "#EFEBE7",
        borderTop: "1px dashed rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 md:gap-10 lg:gap-12 mb-10 md:mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center">
              <div className="font-bold text-xl md:text-2xl tracking-tight flex items-center gap-[7px]" style={{ color: "#000000" }}>
                <img src="./G.svg" alt="" className="md:w-[26px] md:h-[26px] w-[24px] h-[24px]" />  <img src="./genpire.svg" alt="" className=":md:w-[72px] md:h-[18px] w-[67px] h-[16px]" />
              </div>
            </div>
            <p className="font-semibold text-base" style={{ color: "#000000" }}>
              #MakeIt with Genpire
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>
              "Great products aren't born from great ideas alone, but from the courage to transform those ideas into
              reality."
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-xs tracking-wider" style={{ color: "#817B74" }}>
              USEFUL LINKS
            </h3>
            <ul className="flex flex-col gap-2 md:gap-3">
              <li>
                <a href="/pricing" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  About
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Blog
                </a>
              </li>
              <li>
                <a href="/industry" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Industry
                </a>
              </li>
              <li>
                <a href="/suppliers" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Suppliers
                </a>
              </li>
              <li>
                <a href="/friends" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Friends
                </a>
              </li>
              <li>
                <a href="/discover" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Discover
                </a>
              </li>
              <li>
                <a href="/announcements" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Announcements
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Packs & Specs */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-xs tracking-wider" style={{ color: "#817B74" }}>
              TECH PACKS & SPECS
            </h3>
            <ul className="flex flex-col gap-2 md:gap-3">
              <li>
                <a href="/create-tech-pack-online" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Create Tech Pack Online
                </a>
              </li>
              <li>
                <a href="/what-is-a-tech-pack" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  What Is a Tech Pack?
                </a>
              </li>
              <li>
                <a href="/tech-pack-template" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Tech Pack Template PDF
                </a>
              </li>
              <li>
                <a href="/best-tech-pack-software" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Best Tech Pack Software (2025)
                </a>
              </li>
            </ul>
          </div>

          {/* Prototyping & Product Design */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-xs tracking-wider" style={{ color: "#817B74" }}>
              PROTOTYPING & PRODUCT DESIGN
            </h3>
            <ul className="flex flex-col gap-2 md:gap-3">
              <li>
                <a href="/blog/prototype-to-production" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Prototype to Production Guide
                </a>
              </li>
              <li>
                <a href="/blog/prototype-product-without-cad" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Prototype Without CAD Software
                </a>
              </li>
              <li>
                <a href="/blog/sketch-to-factory-journey" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Sketch to Factory Journey
                </a>
              </li>
              <li>
                <a href="/blog/create-production-samples-without-agencies" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Create Samples Without Agencies
                </a>
              </li>
            </ul>
          </div>

          {/* Manufacturing & Supplier Matching */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-xs tracking-wider" style={{ color: "#817B74" }}>
              MANUFACTURING & SUPPLIER MATCHING
            </h3>
            <ul className="flex flex-col gap-2 md:gap-3">
              <li>
                <a href="/blog/contract-manufacturing-services" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Contract Manufacturing Services
                </a>
              </li>
              <li>
                <a href="/blog/turnkey-manufacturing" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Turnkey Manufacturing Solutions
                </a>
              </li>
              <li>
                <a href="/blog/small-batch-production" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Small Batch Production Guide
                </a>
              </li>
              <li>
                <a href="/blog/find-factories-product-idea" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Find Factories for Your Product
                </a>
              </li>
            </ul>
          </div>

          {/* Product Design & Manufacturing */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-xs tracking-wider" style={{ color: "#817B74" }}>
              PRODUCT DESIGN & MANUFACTURING
            </h3>
            <ul className="flex flex-col gap-2 md:gap-3">
              <li>
                <a href="/blog/designers-need-ai-tech-packs" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Why Designers Need AI Tech Packs
                </a>
              </li>
              <li>
                <a href="/blog/make-tech-pack-without-designer" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Make Tech Pack Without Designer
                </a>
              </li>
              <li>
                <a href="/blog/best-ai-tools-product-creation-2025" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Best AI Tools for Product Creation
                </a>
              </li>
              <li>
                <a href="/blog/design-fashion-collection-no-experience" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Design Fashion Collection (No Experience)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 md:pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0"
          style={{ borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <p className="text-sm" style={{ color: "#666666" }}>
              © 2025 Genpire. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <a href="/terms-of-service" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
                Terms of Service
              </a>
              <a href="/privacy-policy" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
                Privacy Policy
              </a>
              <a href="/contact-us" className="text-sm hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
                Contact Us
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="m15.54 8.46 2.12 2.12-2.12 2.12M17.66 10.59l1.17-1.17a2 2 0 0 1 2.83 0l.01.01a2 2 0 0 1 0 2.83l-1.17 1.17" />
              </svg>
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "#666666" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
