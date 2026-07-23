export const EMPTY_ADDRESS_FORM = {
  contact: { email: "", marketingOptIn: true },
  delivery: {
    label: "",
    addressPreview: "",
    recipientId: "primary",
  },
  recipients: [
    { id: "primary", name: "", phone: "", selected: true },
    { id: "other", name: "Someone else will be at the door", phone: "", selected: false },
  ],
  accountType: "personal",
  business: {
    country: "Saudi Arabia",
    organizationName: "",
    organizationNameAr: "",
    crNumber: "",
    vatNumber: "",
    invitationCode: "",
    buildingNo: "",
    street: "",
    secondary: "",
    district: "",
    postalCode: "",
    city: "",
    email: "",
    phone: "",
  },
};
