import type { Schema } from "../types";

export const schema: Schema = {
  id: "default",
  name: "Schéma cible",
  columns: [
    { key: "job_id", label: "job # (id)", required: true },
    { key: "actual_start_date", label: "actual start date", required: true },
    { key: "customer", label: "customer", required: true },
    {
      key: "customer_accounting_reference",
      label: "customer accounting reference",
      required: false,
    },
    { key: "consumer", label: "consumer", required: false },
    {
      key: "consumer_record_number",
      label: "consumer record number",
      required: false,
    },
    { key: "language", label: "language", required: false },
    { key: "interpreter_id", label: "interpreter id", required: false },
    {
      key: "cancellation_reason",
      label: "cancellation reason",
      required: false,
    },
    {
      key: "cancellation_date_time",
      label: "cancellation date time",
      required: false,
    },
    { key: "secteur_activite", label: "Secteur d'activité", required: false },
    {
      key: "centre_cout",
      label: "# Centre de coût / # Budget",
      required: false,
    },
    { key: "sujet", label: "Sujet", required: false },
    {
      key: "travel_time_billable",
      label: "Travel Time (Hours)-billable",
      required: false,
    },
    {
      key: "travel_time_payable",
      label: "Travel Time (Hours)-payable",
      required: false,
    },
    { key: "clock_payable", label: "Clock (Hours)-payable", required: false },
    { key: "mileage_payable", label: "Mileage-payable", required: false },
    { key: "parking_payable", label: "Parking-payable", required: false },
    { key: "misc_billable", label: "Misc. (Hours)-billable", required: false },
    { key: "misc_payable", label: "Misc. (Hours)-payable", required: false },
    {
      key: "meal_break_payable",
      label: "Meal Break (Hours)-payable",
      required: false,
    },
    {
      key: "estimated_duration",
      label: "estimated duration (hrs)",
      required: false,
    },
    { key: "booking_mode", label: "booking mode", required: false },
    {
      key: "receivable_payable_duration",
      label: "receivable - payable duration (hours)",
      required: false,
    },
    {
      key: "payable_payable_duration",
      label: "payable - payable duration (hours)",
      required: false,
    },
    { key: "food_drink", label: "Food & Drink", required: false },
    { key: "miscellaneous", label: "Miscellaneous", required: false },
    { key: "misc_fee", label: "Misc. Fee", required: false },
    { key: "booking_signer", label: "booking signer", required: false },
  ],
};
