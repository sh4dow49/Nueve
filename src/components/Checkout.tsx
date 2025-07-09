import React, { useState } from 'react';
import { X, MapPin, CreditCard, Truck, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Address, CheckoutData } from '../types';

export default function Checkout() {
  const { state, dispatch } = useApp();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);

  if (!state.isCheckoutOpen) return null;

  const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryCharge = total > 500 ? 0 : 50;
  const finalTotal = total + deliveryCharge;

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) return;

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress
    };

    dispatch({ type: 'ADD_ADDRESS', payload: address });
    setSelectedAddress(address);
    setShowAddAddress(false);
    setNewAddress({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !state.user) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const order = {
        id: Date.now().toString(),
        userId: state.user!.id,
        items: [...state.cart],
        address: selectedAddress,
        total: finalTotal,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'CLOSE_CHECKOUT' });
      setLoading(false);
      
      // Show success message or redirect
      alert('Order placed successfully!');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-pastel-blue shadow-lg">
        <div className="sticky top-0 bg-pastel-blue-light z-10 flex items-center justify-between p-4 border-b border-pastel-blue">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Checkout
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CHECKOUT' })}
            className="bg-white text-slate-500 p-2 hover:bg-pastel-blue hover:text-white rounded-full transition-all duration-200 shadow-sm border border-pastel-blue hover:scale-110 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Address & Payment */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <div className="bg-pastel-green-light p-4 rounded-xl border border-pastel-green">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-pastel-green-dark text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-pastel-green transition-all duration-200 flex items-center space-x-1 shadow-sm border border-pastel-green hover:scale-105"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
                  </button>
                </div>

                {showAddAddress && (
                  <div className="mb-4 p-4 bg-white rounded-xl border border-pastel-green space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                        className="px-3 py-2 bg-pastel-blue-light border border-pastel-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-dark text-sm font-medium"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                        className="px-3 py-2 bg-pastel-orange-light border border-pastel-orange rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-orange-dark text-sm font-medium"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                      className="w-full px-3 py-2 bg-pastel-lemon-light border border-pastel-lemon rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-lemon-dark text-sm font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                      className="w-full px-3 py-2 bg-pastel-purple-light border border-pastel-purple rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-purple-dark text-sm font-medium"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="px-3 py-2 bg-pastel-pink-light border border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink-dark text-sm font-medium"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="px-3 py-2 bg-pastel-grey-light border border-pastel-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-grey-dark text-sm font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        className="px-3 py-2 bg-pastel-blue-light border border-pastel-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-dark text-sm font-medium"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="default"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                        className="w-4 h-4 text-pastel-green-dark bg-pastel-green-light border-pastel-green rounded focus:ring-pastel-green-dark"
                      />
                      <label htmlFor="default" className="text-sm text-slate-600">
                        Set as default address
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddAddress}
                        className="bg-pastel-green-dark text-white px-4 py-2 rounded-lg font-medium hover:bg-pastel-green transition-all duration-200 text-sm shadow-sm border border-pastel-green hover:scale-105"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setShowAddAddress(false)}
                        className="bg-pastel-grey text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-pastel-grey-dark transition-all duration-200 text-sm shadow-sm border border-pastel-grey-dark"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {state.addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedAddress?.id === address.id
                          ? 'border-pastel-green-dark bg-pastel-green shadow-sm'
                          : 'border-pastel-grey bg-white hover:bg-pastel-green-light'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-700">{address.name}</p>
                          <p className="text-sm text-slate-600">{address.phone}</p>
                          <p className="text-sm text-slate-600">
                            {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        {address.isDefault && (
                          <span className="bg-pastel-blue text-white text-xs px-2 py-1 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-pastel-orange-light p-4 rounded-xl border border-pastel-orange">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                
                <div className="space-y-2">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                      paymentMethod === 'cod'
                        ? 'border-pastel-orange-dark bg-pastel-orange shadow-sm'
                        : 'border-pastel-grey bg-white hover:bg-pastel-orange-light'
                    }`}
                  >
                    <p className="font-medium text-slate-700">Cash on Delivery</p>
                    <p className="text-sm text-slate-600">Pay when your order arrives</p>
                  </div>
                  
                  <div
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                      paymentMethod === 'online'
                        ? 'border-pastel-orange-dark bg-pastel-orange shadow-sm'
                        : 'border-pastel-grey bg-white hover:bg-pastel-orange-light'
                    }`}
                  >
                    <p className="font-medium text-slate-700">Online Payment</p>
                    <p className="text-sm text-slate-600">Pay now with UPI, Card, or Net Banking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="bg-pastel-blue-light p-4 rounded-xl border border-pastel-blue">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {state.cart.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-pastel-blue shadow-sm">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-pastel-blue-dark"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 text-sm">{item.product.name}</h4>
                      <p className="text-xs text-slate-600">
                        {item.selectedSize} • {item.selectedColor} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-slate-700">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-pastel-blue pt-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery:</span>
                  <span>{deliveryCharge === 0 ? 'Free' : `$${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-slate-700 border-t border-pastel-blue pt-2">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || loading}
                className="w-full mt-6 bg-pastel-blue-dark text-white py-3 rounded-xl font-medium hover:bg-pastel-blue transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-pastel-blue hover:scale-105 transform hover:-rotate-1"
              >
                {loading ? 'Placing Order...' : `Place Order - $${finalTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}