export const VEHICLE_TYPES = ['2 Ton Van','4 Ton Truck','8 Ton Truck','14 Ton Truck','24 Ton Semi-Truck','Flatbed','Refrigerated','Crane Truck','Tipper Truck','Tanker','Lowbed','Curtainsider']
export const CARGO_TYPES = ['General Freight','Building Materials','Agricultural Produce','Livestock','Mining Equipment','Retail Goods','Refrigerated Goods','Hazardous Materials','Machinery','Furniture','Electronics','Bulk Cargo']
export const BW_CITIES = ['Gaborone','Francistown','Maun','Kasane','Jwaneng','Lobatse','Selebi-Phikwe','Orapa','Palapye','Serowe','Kanye','Molepolole']
export const ROUTES = [
  { from:'Gaborone',from_lat:-24.6282,from_lng:25.9231,to:'Francistown',to_lat:-21.1661,to_lng:27.5114,km:436 },
  { from:'Gaborone',from_lat:-24.6282,from_lng:25.9231,to:'Maun',to_lat:-19.9833,to_lng:23.4167,km:697 },
  { from:'Gaborone',from_lat:-24.6282,from_lng:25.9231,to:'Kasane',to_lat:-17.7997,to_lng:25.1500,km:934 },
  { from:'Gaborone',from_lat:-24.6282,from_lng:25.9231,to:'Jwaneng',to_lat:-24.6019,to_lng:24.7300,km:95 },
  { from:'Francistown',from_lat:-21.1661,from_lng:27.5114,to:'Maun',to_lat:-19.9833,to_lng:23.4167,km:465 },
  { from:'Gaborone',from_lat:-24.6282,from_lng:25.9231,to:'Johannesburg',to_lat:-26.2041,to_lng:28.0473,km:362 },
]
export const REPORT_TYPES = [
  { id:'checkpoint',  label:'Police Checkpoint',   emoji:'🚔', severity:2 },
  { id:'roadblock',   label:'Roadblock',            emoji:'🚧', severity:3 },
  { id:'accident',    label:'Accident',             emoji:'🚨', severity:4 },
  { id:'traffic',     label:'Traffic Congestion',   emoji:'🚗', severity:2 },
  { id:'breakdown',   label:'Vehicle Breakdown',    emoji:'🔧', severity:2 },
  { id:'flood',       label:'Flood / Water',        emoji:'🌊', severity:5 },
  { id:'construction',label:'Road Construction',    emoji:'🏗️', severity:2 },
  { id:'weighbridge', label:'Weighbridge Queue',    emoji:'⚖️', severity:2 },
  { id:'fuel_shortage',label:'Fuel Shortage',       emoji:'⛽', severity:3 },
  { id:'dangerous_road',label:'Dangerous Road',     emoji:'⚠️', severity:4 },
  { id:'unsafe_area', label:'Unsafe Area',          emoji:'🔴', severity:4 },
  { id:'road_closure',label:'Road Closure',         emoji:'🚫', severity:5 },
]
export const PLATFORM_FEE_PCT = 0.05
export const VAT_RATE = 0.14
export const BWP_PER_KM: Record<string, number> = {
  '2 Ton Van':4.5,'4 Ton Truck':6.8,'8 Ton Truck':9.2,'14 Ton Truck':12.5,
  '24 Ton Semi-Truck':16.8,'Flatbed':14.0,'Refrigerated':15.5,'Crane Truck':18.0,
  'Tipper Truck':13.0,'Tanker':17.5,'Lowbed':19.0,'Curtainsider':13.5,
}
