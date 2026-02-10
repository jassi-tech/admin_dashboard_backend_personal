export type Location = [number, number, string];

export const locations: Location[] = [
  [28.6139, 77.209, 'User 1: New Delhi'],
  [30.710807653239343,76.71079510757333, 'User 2: Chandigarh'],
];

export const getLocations = (req: any, res: any) => {
    res.json(locations);
};