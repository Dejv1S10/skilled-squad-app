

## Plán aplikace: Platforma pro domácí služby (pracovní název "HomeHelp")

### 🎯 Cíl projektu
Vytvořit marketplace aplikaci inspirovanou Woltem, kde zákazníci mohou snadno najít a objednat pracovníky pro domácí služby – od zahradních prací přes kutilství až po stěhování.

---

### 👥 Uživatelské role

**Zákazníci**
- Vyhledávání služeb podle klíčových slov
- Prohlížení profilů pracovníků s cenami a hodnocením
- Odesílání objednávek
- Hodnocení dokončených prací

**Pracovníci**
- Registrace a správa profilu
- Nastavení nabízených služeb a cen
- Přepínač dostupnosti (online/offline)
- Přijímání/odmítání objednávek
- Přehled historie objednávek

---

### 📱 Hlavní obrazovky

**1. Domovská stránka (pro zákazníky)**
- Velké vyhledávací pole
- Kategorie služeb (Zahradní práce, Kutilství, Úklid, Stěhování)
- Doporučení pracovníků

**2. Výsledky vyhledávání**
- Seznam dostupných pracovníků
- Filtrování podle ceny a hodnocení
- Každý pracovník zobrazí: fotku, jméno, hodnocení (hvězdičky), cenu za hodinu, specializace

**3. Detail pracovníka**
- Kompletní profil s popisem
- Seznam služeb a ceník
- Recenze od zákazníků
- Tlačítko "Objednat službu"

**4. Proces objednávky**
- Výběr konkrétní služby
- Popis práce od zákazníka
- Návrh termínu
- Odeslání požadavku

**5. Dashboard pro pracovníky**
- Přepínač dostupnosti (online/offline)
- Příchozí objednávky k potvrzení
- Správa služeb a cen
- Statistiky a hodnocení

**6. Přehled objednávek**
- Historie pro zákazníky i pracovníky
- Stavy: Čeká na potvrzení, Potvrzeno, Dokončeno, Zrušeno
- Možnost hodnocení po dokončení

---

### 🎨 Design
Moderní a čistý vzhled s:
- Světlým pozadím a jemnými stíny
- Zelenou akcentovou barvou (evokuje přírodu a domov)
- Přehlednou typografií
- Responzivním designem pro mobily i desktop

---

### 🔧 Technické řešení
- **Frontend:** React s Tailwind CSS
- **Backend:** Supabase (databáze, autentizace)
- **Databáze:** Tabulky pro uživatele, pracovníky, služby, objednávky a hodnocení

---

### 📋 Fáze implementace

**Fáze 1: Základ**
- Nastavení Supabase a databázové struktury
- Autentizace (registrace/přihlášení)
- Základní layout aplikace

**Fáze 2: Zákaznická část**
- Vyhledávání a filtry
- Zobrazení pracovníků s hodnocením
- Detail pracovníka

**Fáze 3: Pracovnická část**
- Dashboard pro pracovníky
- Správa profilu a služeb
- Přepínač dostupnosti

**Fáze 4: Objednávkový systém**
- Vytvoření objednávky
- Přijímání/odmítání
- Stavy objednávek

**Fáze 5: Hodnocení**
- Systém hvězdičkových recenzí
- Zobrazení průměrného hodnocení

