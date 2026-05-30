// Login-phase presets — drive the shared simulation toggles + failedAttempts.
// No amount/payee: there's no transaction yet at login.
export const LOGIN_SCENARIOS = [
  {
    label: "Scenario A",
    sublabel: "Stealth",
    description: "Normal login",
    accentColor: "#60bb46",
    sim: {
      activeCall: false,
      newDevice: false,
      unusualLocation: false,
      unusualTime: false,
      failedAttempts: false,
    },
  },
  {
    label: "Scenario B",
    sublabel: "Caution",
    description: "New city + failed passwords",
    accentColor: "#e69c1a",
    sim: {
      activeCall: false,
      newDevice: false,
      unusualLocation: true,
      unusualTime: false,
      failedAttempts: true,
    },
  },
  {
    label: "Scenario C",
    sublabel: "Intervention",
    description: "New device + new city + failed passwords",
    accentColor: "#e53935",
    sim: {
      activeCall: false,
      newDevice: true,
      unusualLocation: true,
      unusualTime: false,
      failedAttempts: true,
    },
  },
];

// Transaction-phase presets — fill the Send Money form + simulation toggles.
export const TRANSACTION_SCENARIOS = [
  {
    label: "Scenario A",
    sublabel: "Stealth",
    description: "Rs. 500, normal context",
    accentColor: "#60bb46",
    form: {
      payeeId: "9801000001",
      amount: "500",
      purpose: "Family",
      remarks: "",
      activeCall: false,
      newDevice: false,
      unusualLocation: false,
      unusualTime: false,
    },
  },
  {
    label: "Scenario B",
    sublabel: "Caution",
    description: "Rs. 25,000, unusual location",
    accentColor: "#e69c1a",
    form: {
      payeeId: "9801000001",
      amount: "25000",
      purpose: "Other",
      remarks: "",
      activeCall: false,
      newDevice: false,
      unusualLocation: true,
      unusualTime: false,
    },
  },
  {
    label: "Scenario C",
    sublabel: "Intervention",
    description: "Rs. 50,000, active call + unusual location",
    accentColor: "#e53935",
    form: {
      payeeId: "9801000001",
      amount: "50000",
      purpose: "Other",
      remarks: "",
      activeCall: true,
      newDevice: false,
      unusualLocation: true,
      unusualTime: false,
    },
  },
];
