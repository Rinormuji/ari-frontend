import logo from '../assets/images/logo.png'

const Footer = () => {
  return (
    <footer className="pt-10">
      <div className="bg-[#000000] border-t border-gray-800 py-10 rounded-tl-[35px] rounded-tr-[35px] max-w-full mx-auto">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* 1️⃣ Logo - Majtas */}
          <div className="flex items-center justify-start w-1/3">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src={logo}
                alt="Ari Real Estate"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* 2️⃣ Linket e Navigimit - Në Mes */}
          <div className="flex flex-col md:flex-row md:space-x-8 items-center space-y-2 md:space-y-0 w-1/3 justify-center">
            <a href="/" className="text-[#FFAE42] hover:text-white transition-all duration-300">Ballina</a>
            <a href="/properties" className="text-[#FFAE42] hover:text-white transition-all duration-300">Kërko prona</a>
            <a href="/about" className="text-[#FFAE42] hover:text-white transition-all duration-300">Rreth Neth</a>
            <a href="/contact" className="text-[#FFAE42] hover:text-white transition-all duration-300">Kontakt</a>
            <a href="/terms" className="text-[#FFAE42] hover:text-white transition-all duration-300">Terms & Conditions</a>
            <a href="/privacy" className="text-[#FFAE42] hover:text-white transition-all duration-300">Privacy Policy</a>
          </div>

          {/* 3️⃣ Informacionet e Pronarit - Djathtas */}
          <div className="text-right space-y-1 w-1/3 mr-[20px]">
            <p className="font-semibold text-[#FFAE42]">Elion Sopi</p>
            <a href="tel:+38345465726" className="text-[#FFAE42] hover:text-white transition-all duration-300 block">(+383) 45-465-726</a>
            <a href="mailto:elionsopi@ari-re.com" className="text-[#FFAE42] hover:text-white transition-all duration-300 block">elionsopi@ari-re.com</a>
            <p className="text-sm text-gray-300 pt-2">© 2025 Ari Real Estate. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer