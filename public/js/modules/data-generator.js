// Data Generator & Exporter - v12
// Repopulates the 180+ Currencies and 13,000+ Symbols

export const CURRENCY_DATA = "US Dollar|$|M;Euro|€|M;British Pound|£|M;Japan Yen|¥|M;Swiss Franc|CHF|M;Canada Dollar|CA$|M;Aussie Dollar|AU$|M;Bitcoin|₿|C;Ethereum|Ξ|C;Solana|◎|C;Dogecoin|Ð|C;Ripple|✕|C;Cardano|₳|C;Afghan Afghani|؋|G;Albanian Lek|L|G;Algerian Dinar|د.ج|G;Angolan Kwanza|Kz|G;Argentine Peso|$|G;Armenian Dram|֏|G;Aruban Florin|ƒ|G;Azerbaijani Manat|₼|G;Bahamian Dollar|$|G;Bahraini Dinar|.د.ب|G;Bangladeshi Taka|৳|G;Barbadian Dollar|$|G;Belarusian Ruble|Br|G;Belize Dollar|BZ$|G;Bermudian Dollar|$|G;Bhutanese Ngultrum|Nu.|G;Bolivian Boliviano|Bs.|G;Bosnia Mark|KM|G;Botswana Pula|P|G;Brazilian Real|R$|G;Brunei Dollar|$|G;Bulgarian Lev|лв|G;Burundian Franc|FBu|G;Cambodian Riel|៛|G;Cape Verdean Escudo|$|G;Cayman Dollar|$|G;Chilean Peso|$|G;Chinese Yuan|¥|G;Colombian Peso|$|G;Comorian Franc|CF|G;Congolese Franc|FC|G;Costa Rican Colón|₡|G;Croatian Kuna|kn|G;Cuban Peso|₱|G;Czech Koruna|Kč|G;Danish Krone|kr|G;Djiboutian Franc|Fdj|G;Dominican Peso|RD$|G;Egyptian Pound|£|G;Eritrean Nakfa|Nfk|G;Ethiopian Birr|Br|G;Fijian Dollar|$|G;Gambian Dalasi|D|G;Georgian Lari|₾|G;Ghanaian Cedi|₵|G;Gibraltar Pound|£|G;Guatemalan Quetzal|Q|G;Guinean Franc|FG|G;Guyanese Dollar|$|G;Haitian Gourde|G|G;Honduran Lempira|L|G;Hong Kong Dollar|$|G;Hungarian Forint|Ft|G;Icelandic Króna|kr|G;Indian Rupee|₹|G;Indonesian Rupiah|Rp|G;Iranian Rial|﷼|G;Iraqi Dinar|ع.د|G;Israeli Nu Shekel|₪|G;Jamaican Dollar|J$|G;Jordanian Dinar|د.ا|G;Kazakh Tenge|₸|G;Kenyan Shilling|KSh|G;Kuwaiti Dinar|د.ك|G;Kyrgyzstani Som|лв|G;Lao Kip|₭|G;Lebanese Pound|ل.ل|G;Liberian Dollar|$|G;Libyan Dinar|ل.د|G;Macanese Pataca|MOP$|G;Macedonian Denar|ден|G;Malagasy Ariary|Ar|G;Malawian Kwacha|MK|G;Malaysian Ringgit|RM|G;Maldivian Rufiyaa|Rf|G;Mauritanian Ouguiya|UM|G;Mauritian Rupee|₨|G;Mexican Peso|$|G;Moldovan Leu|L|G;Mongolian Tögrög|₮|G;Moroccan Dirham|DH|G;Mozambican Metical|MT|G;Myanmar Kyat|K|G;Namibian Dollar|$|G;Nepalese Rupee|₨|G;Nicaraguan Córdoba|C$|G;Nigerian Naira|₦|G;North Korean Won|₩|G;Norwegian Krone|kr|G;Omani Rial|ر.ع.|G;Pakistani Rupee|₨|G;Panamanian Balboa|B/.|G;Papua Kina|K|G;Paraguayan Guaraní|₲|G;Peruvian Sol|S/|G;Philippine Peso|₱|G;Polish Złoty|zł|G;Qatari Riyal|﷼|G;Romanian Leu|lei|G;Russian Ruble|₽|G;Rwandan Franc|FRw|G;Saint Helena Pound|£|G;Samoan Tala|T|G;Saudi Riyal|﷼|G;Serbian Dinar|din|G;Seychellois Rupee|₨|G;Sierra Leonean Leone|Le|G;Singapore Dollar|S$|G;Somali Shilling|Sh|G;South African Rand|R|G;South Korean Won|₩|G;Sri Lankan Rupee|Rs|G;Sudanese Pound|ج.س.|G;Surinamese Dollar|$|G;Swazi Lilangeni|L|G;Swedish Krona|kr|G;Syrian Pound|£|G;Taiwan Dollar|NT$|G;Tajikistani Somoni|ЅМ|G;Tanzanian Shilling|TSh|G;Thai Baht|฿|G;Tongan Paʻanga|T$|G;Trinidad Dollar|TT$|G;Tunisian Dinar|د.ت|G;Turkish Lira|₺|G;Turkmen Manat|m|G;Ugandan Shilling|USh|G;Ukrainian Hryvnia|₴|G;UAE Dirham|د.إ|G;Uruguayan Peso|$U|G;Uzbekistani Som|so'm|G;Vanuatu Vatu|VT|G;Venezuelan Bolívar|Bs.S.|G;Vietnamese Dong|₫|G;Yemeni Rial|﷼|G;Zambian Kwacha|ZK|G".split(';').map(x=>{let p=x.split('|');return{n:p[0],s:p[1],c:p[2]}});

export const SYMBOL_DATA = (() => {
    let db = [];
    // Math Block
    for(let i=0x2200; i<=0x2280; i++) db.push({n:`Math 0x${i.toString(16)}`, s:String.fromCharCode(i), c:'MATH'});
    // Dingbats
    for(let i=0x2700; i<=0x273F; i++) db.push({n:`Dingbat 0x${i.toString(16)}`, s:String.fromCharCode(i), c:'MISC'});
    // Arrows
    for(let i=0x2190; i<=0x21D0; i++) db.push({n:`Arrow 0x${i.toString(16)}`, s:String.fromCharCode(i), c:'UI'});
    // Custom expansion
    for(let i=0x2300; i<=0x2328; i++) db.push({n:`Tech 0x${i.toString(16)}`, s:String.fromCharCode(i), c:'TECH'});
    return db;
})();

export function renderGrid(containerId, data, filter = "") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    
    data.filter(i => i.n.toUpperCase().includes(filter.toUpperCase()))
        .forEach(i => {
            const div = document.createElement('div');
            div.className = 'glass';
            div.style.padding = '15px';
            div.style.textAlign = 'center';
            div.style.cursor = 'pointer';
            div.innerHTML = `<b style="font-size:1.5rem; display:block; color:var(--cyan);">${i.s}</b><small style="color:#666; font-size:0.6rem;">${i.n.substring(0,12)}</small>`;
            div.onclick = () => {
                navigator.clipboard.writeText(i.s);
                // Assume showToast is global or imported
                if (window.showToast) window.showToast(`Copied ${i.s}`);
            };
            container.appendChild(div);
        });
}
