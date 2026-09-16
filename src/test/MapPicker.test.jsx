import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import MapPicker from '../admin/components/MapPicker';
const mock = vi.hoisted(() => ({ panTo: vi.fn(), events: {} }));
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  TileLayer: () => null,
  Marker: ({ position }) => <output data-testid="marker">{position.join(',')}</output>,
  useMap: () => mock,
  useMapEvents: (events) => { mock.events = events; },
}));
vi.mock('../utils/leafletIcons', () => ({ configureLeafletIcons: vi.fn() }));
function Picker({ initial = ['', ''] }) {
  const [position, setPosition] = useState(initial);
  return <form data-testid="form"><MapPicker lat={position[0]} lng={position[1]} onSelect={(lat, lng) => setPosition([lat, lng])} /><button type="button" onClick={() => mock.events.click({ latlng: { lat: 42.5, lng: 21.2 } })}>Map click</button></form>;
}
beforeEach(() => mock.panTo.mockClear());
it('synchronizes typed coordinates and mouse selection in both directions', () => {
  render(<Picker />);
  fireEvent.change(screen.getByLabelText('Latitude (Lat)'), { target: { value: '42.6' } });
  fireEvent.change(screen.getByLabelText('Longitude (Lng)'), { target: { value: '21.1' } });
  expect(screen.getByTestId('marker')).toHaveTextContent('42.6,21.1');
  expect(mock.panTo).toHaveBeenLastCalledWith([42.6, 21.1]);
  fireEvent.click(screen.getByText('Map click'));
  expect(screen.getByLabelText('Latitude (Lat)')).toHaveValue(42.5);
  expect(screen.getByLabelText('Longitude (Lng)')).toHaveValue(21.2);
});
it('accepts zero and negative coordinates for existing properties', () => {
  render(<Picker initial={[0, -12.5]} />);
  expect(screen.getByTestId('marker')).toHaveTextContent('0,-12.5');
  expect(screen.getByTestId('form').checkValidity()).toBe(true);
});
it('blocks incomplete and out-of-range coordinates without placing an invalid marker', () => {
  render(<Picker />);
  expect(screen.getByTestId('form').checkValidity()).toBe(true);
  fireEvent.change(screen.getByLabelText('Latitude (Lat)'), { target: { value: '91' } });
  expect(screen.getByTestId('form').checkValidity()).toBe(false);
  expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Latitude (Lat)'), { target: { value: '42' } });
  expect(screen.getByTestId('form').checkValidity()).toBe(false);
  fireEvent.change(screen.getByLabelText('Longitude (Lng)'), { target: { value: '181' } });
  expect(screen.getByTestId('form').checkValidity()).toBe(false);
  expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
});
