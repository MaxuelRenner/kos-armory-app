# 🛡️ Arsenal BG (Арсенал БГ) - Digital Firearm & KOS Manager

<div align="center">
  <img src="https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=D04A37" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br />

**Arsenal BG** is a comprehensive, cross-platform mobile application built specifically for firearm owners in Bulgaria. It acts as a digital armory, maintenance tracker, and legal compliance assistant, ensuring users never miss a KOS (Контрол на общоопасните средства) permit renewal deadline.

---

## 📖 Table of Contents
1. [🇧🇬 За проекта (Bulgarian Overview)](#-за-проекта)
2. [✨ Comprehensive Feature List](#-comprehensive-feature-list)
3. [🧠 Smart Logic & Architecture](#-smart-logic--architecture)
4. [🛠️ Technology Stack](#-technology-stack)
5. [🗄️ Database Schema (Supabase)](#️-database-schema-supabase)
6. [📂 Project Structure](#-project-structure)
7. [🚀 Local Development Setup](#-local-development-setup)
8. [📦 Building for Production (EAS)](#-building-for-production-eas)
9. [📱 UI/UX & Theming](#-uiux--theming)
10. [⚖️ License & Legal Disclaimer](#️-license--legal-disclaimer)

---

## 🇧🇬 За проекта
**Арсенал БГ** е създаден с една основна цел: да улесни собствениците на огнестрелни оръжия в България при управлението на техния арсенал и спазването на законовите срокове към служба КОС.

**Основни предимства:**
- **Безкомпромисно следене на КОС:** Приложението автоматично изчислява 5-годишния срок на вашето разрешително и ви предупреждава 30 дни преди изтичането му.
- **Интерактивен списък с документи:** Вграден чеклист за подновяване (медицинско, съдимост, такси, технически преглед). Бутонът за подновяване се отключва *само* когато всички документи са събрани и сте в 30-дневния срок.
- **Дневник на тренировките:** Записвайте всяко посещение на стрелбището. Системата води статистика и ви напомня да почистите оръжието си.
- **Умни защити при въвеждане:** Приложението знае, че една ловна пушка не може да тежи 800 грама, и че пистолет Макаров стреля с 9x18mm. Системата предотвратява грешки при въвеждане чрез сложна вътрешна логика.

---

## ✨ Comprehensive Feature List

### 1. Dashboard & Inventory Management
* **Dynamic Sorting:** The home screen automatically prioritizes weapons requiring attention. Expired permits float to the top (Red), followed by expiring soon (Orange), followed by dirty weapons needing cleaning, and finally valid weapons.
* **Intelligent Filtering:** Users can search by Serial Number, Manufacturer, or Model, and apply dual-dropdown filters for specific Weapon Types (e.g., Carbine, SMG) and Calibers.

### 2. Deep Firearm Profiles
* **Hero Image Integration:** Users can snap a photo directly from their camera or upload from their gallery. Images are securely hosted in Supabase Storage.
* **Optimistic UI Updates:** Actions like incrementing the "Training Counter" instantly update the screen locally before confirming with the database, providing a buttery-smooth UX.
* **Persistent Checklists:** Document requirements for KOS renewals are saved to the device's local memory (`AsyncStorage`), meaning users can check off documents over weeks without losing progress.

### 3. KOS Lifecycle Management
* **Smart Date Computation:** The app differentiates between the `kos_registration_date` (first purchase) and `last_renewed_date`. It accurately computes exactly how many days remain in the 5-year legal window.
* **Locked Renewal Flow:** To prevent accidental renewals, the system locks the "Renew KOS" button until the user is strictly within the final 30 days *and* has checked off every required legal document.

### 4. Range & Maintenance Tracking
* **Training Counter:** Logs exactly how many times a specific firearm has been taken to the range.
* **Cleaning Workflow:** Hitting the "Training" button tags the weapon with a `needs_cleaning` flag and activates a visual warning badge across the app until the user logs a "Cleaned" action.

---

## 🧠 Smart Logic & Architecture

### Dynamic Caliber Mapping
Instead of presenting the user with 50 different calibers, the `Add Gun` screen dynamically filters calibers based on the selected weapon type. 
* *Example:* Selecting "Гладкоцевна" (Shotgun) will only show 12 Gauge, 16 Gauge, 20 Gauge, etc. Selecting "Пистолет" (Pistol) will show 9x19mm, .45 ACP, etc.

### Strict Weight Validation Bounds
To prevent database corruption and typos, the system uses strict minimum and maximum weight bounds (in grams) based on the firearm's physical classification:
* **Pistols/Revolvers:** 100g – 3,000g
* **SMGs:** 1,000g – 5,000g
* **Carbines:** 1,500g – 8,000g
* **Shotguns:** 2,000g – 6,000g
* **Bolt-Action Rifles:** 2,000g – 12,000g

### Graceful Fallbacks (Error Handling)
The app features comprehensive `try/catch` blocks around all local Push Notifications. This ensures that the app gracefully falls back without crashing if run in environments that do not support background notifications (like the Expo Go sandbox).

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | `React Native` | Core mobile rendering. |
| **Routing** | `Expo Router (v3)` | File-based routing, native stack navigation, and deep linking. |
| **Backend & Database** | `Supabase` | PostgreSQL database, Row Level Security (RLS), and API layer. |
| **Authentication** | `Supabase Auth` | Secure user sign-up, login, and session management. |
| **File Storage** | `Supabase Storage` | Hosting user-uploaded firearm photographs. |
| **Local Storage** | `AsyncStorage` | Persisting local states like the Onboarding flag and KOS Checklists. |
| **Hardware APIs** | `expo-image-picker` | Accessing the device camera and photo gallery. |
| **Push Notifications** | `expo-notifications` | Scheduling local hourly reminders and 30-day KOS warnings. |

---

## 🗄️ Database Schema (Supabase)

To recreate this backend environment, execute the following SQL in your Supabase SQL Editor.

### 1. Create the `firearms` Table
```sql
CREATE TABLE public.firearms (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    manufacturer VARCHAR,
    caliber VARCHAR,
    serial_number VARCHAR UNIQUE NOT NULL,
    weight_grams INT4,
    kos_registration_date DATE NOT NULL,
    last_renewed_date DATE,
    image_url VARCHAR,
    training_count INT4 DEFAULT 0,
    needs_cleaning BOOLEAN DEFAULT false,
    last_range_day TIMESTAMPTZ,
    last_cleaned_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

2. Create the Storage Bucket
Create a new Supabase Storage Bucket named gun-images and set it to Public.

3. Row Level Security (RLS)
To ensure users can only see their own firearms, enable RLS:

SQL
ALTER TABLE public.firearms ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own guns
CREATE POLICY "Users can view own firearms" ON public.firearms
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own guns
CREATE POLICY "Users can insert own firearms" ON public.firearms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own guns
CREATE POLICY "Users can update own firearms" ON public.firearms
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own guns
CREATE POLICY "Users can delete own firearms" ON public.firearms
    FOR DELETE USING (auth.uid() = user_id);

📂 Project Structure
Plaintext
kos-armory-app/
├── app/                      # Expo Router App Directory
│   ├── (tabs)/               # Bottom Tab Navigation
│   │   ├── _layout.tsx       # Tab Bar Configuration
│   │   ├── index.tsx         # Main Dashboard & Inventory
│   │   ├── add-gun.tsx       # Gun Creation & Validation Form
│   │   └── settings.tsx      # User Profile, Theme & Auth Settings
│   ├── gun/
│   │   └── [id].tsx          # Dynamic Firearm Detail Screen
│   ├── _layout.tsx           # Root Layout (Auth Provider Wrap)
│   ├── login.tsx             # Authentication Screen
│   └── onboarding.tsx        # Detailed App Tutorial
├── components/               # Reusable UI Components
├── constants/                # Global Variables & Logic
│   ├── kosLogic.ts           # Expiry Math & Status Labeling
│   ├── notifications.ts      # Push Notification Scheduling
│   ├── supabase.ts           # Supabase Client Initialization
│   └── theme.ts              # Global Color Palettes & Spacing
├── context/                  # React Contexts
│   ├── AuthContext.tsx       # Supabase Session State
│   └── ThemeContext.tsx      # Dark/Light/Custom Theme Engine
├── assets/                   # Fonts, Icons, and Splash Screens
├── app.json                  # Expo Configuration Manifest
├── package.json              # Dependencies
└── README.md                 # You are here

🚀 Local Development Setup
Prerequisites
Node.js (v18 or higher)

npm or yarn

Expo Go app installed on your physical mobile device

A Supabase Account (Free Tier is sufficient)

1. Clone the repository
Bash
git clone [https://github.com/YourUsername/kos-armory-app.git](https://github.com/YourUsername/kos-armory-app.git)
cd kos-armory-app

2. Install Dependencies
Bash
npm install

3. Environment Configuration
Create a .env file in the root directory. You will find these keys in your Supabase Dashboard under Project Settings > API.

Code snippet
EXPO_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key-string-here

4. Start the Metro Bundler
Bash
npx expo start --clear
Scan the generated QR code using your phone's camera (iOS) or the Expo Go app (Android).

📦 Building for Production (EAS)
This project uses Expo Application Services (EAS) to compile the raw React Native code into native binaries ready for app store distribution.

1. Install EAS CLI
Bash
npm install -g eas-cli
eas login
2. Configure the Build
Ensure your app.json has a unique bundle identifier (e.g., com.yourname.arsenalbg) and version numbering.

3. Build for Android (Google Play Store)
Generates an Android App Bundle (.aab):

Bash
eas build --platform android --profile production
(To build a testable .apk file to share directly with friends, use --profile preview assuming your eas.json is configured for it).

4. Build for iOS (Apple App Store)
Requires an active paid Apple Developer Account:

Bash
eas build --platform ios --profile production
📱 UI/UX & Theming
Arsenal BG ships with a highly customized Context-based theming engine. It entirely avoids generic UI libraries in favor of bespoke react-native stylesheets.

Color Psychology Integration:

🟢 Green (Valid): Indicates the KOS permit has more than 30 days remaining. Safe.

🟠 Amber (Warning): Triggers exactly at the 30-day mark. Matches the physical world urgency of interacting with local authorities. Also used for the "Needs Cleaning" badges.

🔴 Red (Danger): Indicates an expired legal permit. Overrides all other UI priorities.

⚖️ License & Legal Disclaimer
Proprietary License
All rights reserved. This source code is provided for reference and portfolio demonstration purposes only. Unauthorized copying, modification, or distribution is strictly prohibited.

Legal Disclaimer
Arsenal BG is an administrative utility tool. It relies entirely on the data inputted by the user. The developers, creators, and maintainers of this application assume ZERO legal liability or responsibility for missed deadlines, expired permits, fines, confiscations, or any interactions with local law enforcement (МВР/КОС). The user is solely responsible for obeying local firearm laws and maintaining their physical documentation.