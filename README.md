# 📦 Application Folder Structure

/application  
├── app  
│   ├── (app)  
│   │   ├── (call)  
│   │   │   ├── _layout.tsx  
│   │   │   ├── audio-call.tsx  
│   │   │   ├── video-call.tsx  
│   │   │   └── feedback.tsx  
│   │   ├── (onboarding)  
│   │   │   ├──_layout.tsx  
│   │   │   └── profile-setup.tsx  
│   │   ├── (user)  
│   │   │   ├── _layout.tsx  
│   │   │   ├── account.tsx  
│   │   │   ├── call-history.tsx  
│   │   │   ├── favorites.tsx  
│   │   │   ├── recharge.tsx  
│   │   │   ├── help.tsx  
│   │   │   ├── home.tsx  
│   │   │   └── transaction-history.tsx  
│   │   ├── (telecaller)  
│   │   │   ├──_layout.tsx  
│   │   │   ├── dashboard.tsx  
│   │   │   ├── account.tsx  
│   │   │   ├── wallet.tsx  
│   │   │   ├── pending.tsx  
│   │   │   └── rejected.tsx  
│   │   └── _layout.tsx  
│   ├── (auth)  
│   │   ├──_layout.tsx  
│   │   ├── otp.tsx  
│   │   └── login.tsx  
│   ├── _layout.tsx  
│   ├── global.css  
│   └── index.tsx  
├── assets  
│   ├── fonts  
│   │   ├── Nexa-Heavy.ttf  
│   │   └── Nexa-ExtraLight.ttf  
│   ├── svgs  
│   │   ├── avatar-1.svg  
│   │   ├── avatar-2.svg  
│   │   ├── avatar-3.svg  
│   │   ├── avatar-4.svg  
│   │   ├── avatar-5.svg  
│   │   ├── avatar-6.svg  
│   │   ├── avatar-7.svg  
│   │   └── avatar-8.svg
│   └── images  
├── components  
│   ├── call  
│   │   ├── AudioConnectedState.tsx  
│   │   ├── CallControls.tsx  
│   │   ├── ConnectingState.tsx  
│   │   ├── IncomingCallOverlay.tsx  
│   │   ├── CallRoomWrapper.tsx  
│   │   └── VideoConnectedState.tsx  
│   ├── shared  
│   │   ├── account  
│   │   │   ├── AccountInfoCard.tsx  
│   │   │   ├── EditProfileForm.tsx  
│   │   │   ├── PersonalInfoCard.tsx  
│   │   │   └── ProfileHeader.tsx  
│   │   ├── avatars  
│   │   │   └── index.tsx  
│   │   ├── help
│   │   │   ├── BugReportDrawer.tsx  
│   │   │   ├── ContactDrawer.tsx  
│   │   │   ├── HelpItem.tsx  
│   │   │   ├── PolicyDrawer.tsx  
│   │   │   └── SectionHeader.tsx  
│   │   ├── profile-setup  
│   │   │   ├── BasicInfoStep.tsx  
│   │   │   ├── TelecallerStep.tsx  
│   │   │   └── OtherSteps.tsx  
│   │   ├── Loading.tsx  
│   │   ├── LanguagePickerModal.tsx  
│   │   └── LogoutModal.tsx  
│   ├── user  
│   │   ├── call-history  
│   │   │   ├── CallDetailsSheet.tsx  
│   │   │   ├── CallHistoryCard.tsx  
│   │   │   └── EmptyCallHistoryState.tsx  
│   │   ├── favorites  
│   │   │   ├── EmptyFavoritesState.tsx  
│   │   │   └── FavoriteTelecallerCard.tsx  
│   │   ├── home  
│   │   │   ├── EmptyTelecallerState.tsx  
│   │   │   ├── TelecallerCard.tsx
│   │   ├── recharge  
│   │   │   ├── BalanceCard.tsx  
│   │   │   ├── ConfirmationModal.tsx  
│   │   │   ├── EmptyPlansState.tsx  
│   │   │   ├── PlanCard.tsx  
│   │   │   └── SuccessModal.tsx  
│   │   ├── transaction-history  
│   │   │   ├── EmptyTransactionState.tsx  
│   │   │   ├── TransactionCard.tsx  
│   │   │   └── TransactionDetailsSheet.tsx  
│   │   ├── skeleton  
│   │   │   ├── PlanCardSkeleton.tsx  
│   │   │   ├── TelecallerCardSkeleton.tsx  
│   │   │   └── TransactionCardSkeleton.tsx  
│   │   ├── Header.tsx  
│   │   ├── TabBar.tsx  
│   │   └── SideDrawer.tsx  
│   ├── telecaller  
│   │   ├── Header.tsx  
│   │   ├── ReapplyDrawer.tsx  
│   │   └── TabBar.tsx  
│   ├── lib  
│   │   └── utils.ts  
│   └── ui  
│       ├── aurora-background.tsx  
│       ├── button.tsx  
│       ├── input.tsx  
│       ├── drawer.tsx  
│       ├── otp-input.tsx  
│       ├── separator.tsx  
│       └── slot.tsx  
├── config  
│   └── api.ts  
├── constants  
│   ├── dummyData.ts  
│   ├── help.ts  
│   ├── language.ts  
│   └── navigation.ts  
├── context  
│   └── AuthContext.tsx  
├── hooks  
│   ├── useActiveCall.ts  
│   ├── useCallTimer.ts  
│   ├── useLiveKitRoom.ts  
│   └── useErrorHandler.ts  
├── schemas  
│   ├── auth.schema.ts  
│   ├── telecaller.schema.ts  
│   └── user.schema.ts  
├── service  
│   └── api.service.ts  
├── socket  
│   ├── hooks  
│   │   ├── useTelecallerSocket.ts  
│   │   └── useUserSocket.ts  
│   ├── telecaller.socket.ts  
│   ├── types.ts  
│   └── user.socket.ts  
├── types  
│   ├── api.d.ts  
│   ├── declarations.d.ts  
│   ├── general.d.ts  
│   └── user.d.ts  
├── utils  
│   ├── toast.tsx
│   ├── permission.ts
│   └── formatter.ts  
├── node_modules  
├── .env  
├── .gitignore  
├── app.json  
├── babel.config.js  
├── eslint.config.js  
├── expo-env.d.ts  
├── metro.config.js  
├── nativewind-env.d.ts  
├── package.json  
├── package-lock.json  
├── README.md  
├── tailwind.config.js  
└── tsconfig.json  

=====================================================================

## 📱 App Routes

app/  
├── _layout.tsx                             # Root layout (AuthProvider, fonts, StatusBar)  
├── index.tsx                               # Splash screen (entry point + navigation logic)  
├── global.css                              # Global styles  
│  
├── (auth)/                                 # 🔓 Public routes (unauthenticated)  
│   ├──_layout.tsx                         # Guard: redirects to (app) if authenticated  
│   ├── login.tsx                           # Login screen  
│   └── otp.tsx                             # OTP verification screen  
│  
└── (app)/                                  # 🔒 Protected routes (authenticated)  
    ├── _layout.tsx                         # Guard: redirects to login if not authenticated  
    │  
    ├── (call)/                             # 📞 Call routes (shared for user & telecaller)  
    │   ├──_layout.tsx                     # Guard: validates profile complete  
    │   ├── audio-call.tsx                  # Audio call screen (connecting → connected states)  
    │   ├── video-call.tsx                  # Video call screen (connecting → connected states, WhatsApp style)  
    │   └── feedback.tsx                    # Post-call feedback screen  
    │  
    ├── (onboarding)/                       # 📝 Profile setup routes (shared for all roles)  
    │   ├── _layout.tsx                     # Guard: redirects if profile already complete  
    │   └── profile-setup.tsx               # Wizard-style profile setup screen  
    │  
    ├── (user)/                             # 👤 User-only routes  
    │   ├──_layout.tsx                     # Guard + socket connection + renders Header, TabBar, SideDrawer  
    │   ├── account.tsx                     # User account screen (view/edit profile)  
    │   ├── call-history.tsx                # User call history screen  
    │   ├── favorites.tsx                   # User favorite telecallers screen (swipeable cards)  
    │   ├── recharge.tsx                    # User recharge coin for connect telecaller screen  
    │   ├── help.tsx                        # Help screen (contact us, privacy, payment policies, T&C)  
    │   ├── home.tsx                        # User home screen (telecaller listing with infinite scroll)  
    │   └── transaction-history.tsx         # User transaction history screen  
    │  
    └── (telecaller)/                       # 📞 Telecaller-only routes  
        ├── _layout.tsx                     # Guard + socket connection  
        ├── dashboard.tsx                   # Telecaller dashboard (APPROVED only)  
        ├── account.tsx                     # Telecaller account settings/ managing screen (APPROVED only)  
        ├── wallet.tsx                      # Telecaller wallet/coin card/withdrawel side (APPROVED only)  
        ├── pending.tsx                     # Approval pending screen  
        └── rejected.tsx                    # Approval rejected screen  

=====================================================================

## 🔌 Socket Structure

socket/  
├── hooks/  
│   ├── useUserSocket.ts                    # Hook for user presence (connects on mount, handles app state & network)  
│   └── useTelecallerSocket.ts              # Hook for telecaller presence (connects on mount, handles app state & network)  
│  
├── user.socket.ts                          # User socket manager (connect, disconnect, getInstance)  
├── telecaller.socket.ts                    # Telecaller socket manager (connect, disconnect, getInstance)  
└── types.ts                                # Shared socket types (ServerEvents, ClientEvents, SocketError)  

## 📞 Call Management System Documentation

## 🔄 Complete Call Workflow

### 1️⃣ Initiation Phase (User Side)

* **Trigger:** User clicks "Audio Call" or "Video Call" button on the Telecaller Profile.
* **Permission Check:** The app validates permissions using `expo-camera`:
  * **Audio Call:** Checks Microphone permission.
  * **Video Call:** Checks both Microphone and Camera permissions.
  * *Result:* If denied, shows an alert and stops. If granted, proceeds.
* **Signaling:** App emits `call:initiate` event via Socket.IO to the Backend.
* **Backend Processing:**
  * Creates a new Call Document in MongoDB with status `RINGING`.
  * Start 30 timer.
* **Notification:** Backend emits:
  * `call:ringing` → User (Caller).
  * `call:incoming` → Telecaller (Receiver).

### 2️⃣ Notification Phase (Telecaller Side)

* **Trigger:** Telecaller receives `call:incoming` socket event.
* **UI:** The `IncomingCallOverlay` appears over the current screen.
* **Action:** Telecaller clicks the "Accept" button.

### 3️⃣ Acceptance & Handshake Phase

* **Telecaller Permission Check:** Before accepting, the app checks Microphone/Camera permissions.
* **Immediate Navigation (UX Optimization):**
  * Telecaller App **immediately** navigates to the Call Screen.
  * Screen shows "Connecting..." state (since the Token is not yet received).
* **Signaling:** Telecaller App emits `call:accept` event via Socket.IO.
* **Backend Processing:**
  * Updates Call Document status to `ACCEPTED`.
  * Clear the 30 seconds timer.
  * Update the telecaller presence to on_call.
  * **Token Generation:** Backend calls `livekit-server-sdk` to generate two secure JWT Tokens (one for User, one for Telecaller).
* **Distribution:** Backend emits `call:accepted` event containing the **LiveKit Token** and **Room Name** to **BOTH** User and Telecaller sockets simultaneously.
  * broadcast to all online users to 'this telecaller presence is change to oncall'.

### 4️⃣ Connection Phase (LiveKit Room Entry)

* **Token Reception:**
  * **User App:** Receives `call:accepted`, extracts the Token, and transitions from "Ringing" to "Connecting".
  * **Telecaller App:** Receives `call:accepted` (while already on the call screen), extracts the Token.
* **LiveKit Connection:**
  * Both apps use the `useLiveKitRoom` hook to connect to LiveKit Cloud using the received Token.
  * `room.connect(url, token)` is called.
* **Media Flow:** Audio (and Video) tracks are published and subscribed. Users can now hear/see each other.

### 5️⃣ Termination Phase

* **Trigger:** User or Telecaller clicks the "End Call" button.
* **Cleanup:**
  * App calls `room.disconnect()` to leave LiveKit.
  * `InCallManager` stops the audio session.
* **Signaling:** App emits `call:end` event via Socket.IO.
* **Backend Processing:**
  * Updates Call Document status to `COMPLETED`.
  * Calculates call duration.
  * Updates Telecaller presence back to `ONLINE`.
* **Notification:** Backend sends `call:ended` event to the other party to force-close their screen.
* **Feedback:** Both users are redirected to the Feedback Screen.
