import React from 'react';
import { X, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Orders() {
  const { state, dispatch } = useApp();

  if (!state.isOrdersOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-pastel-orange-dark" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-pastel-blue-dark" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-pastel-purple-dark" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-pastel-green-dark" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-pastel-pink-dark" />;
      default:
        return <Package className="w-4 h-4 text-pastel-grey-dark" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-pastel-orange-light border-pastel-orange text-pastel-orange-dark';
      case 'confirmed':
        return 'bg-pastel-blue-light border-pastel-blue text-pastel-blue-dark';
      case 'shipped':
        return 'bg-pastel-purple-light border-pastel-purple text-pastel-purple-dark';
      case 'delivered':
        return 'bg-pastel-green-light border-pastel-green text-pastel-green-dark';
      case 'cancelled':
        return 'bg-pastel-pink-light border-pastel-pink text-pastel-pink-dark';
      default:
        return 'bg-pastel-grey-light border-pastel-grey text-pastel-grey-dark';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-pastel-blue shadow-lg">
        <div className="sticky top-0 bg-pastel-blue-light z-10 flex items-center justify-between p-4 border-b border-pastel-blue">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            My Orders ({state.orders.length})
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_ORDERS' })}
            className="bg-white text-slate-500 p-2 hover:bg-pastel-blue hover:text-white rounded-full transition-all duration-200 shadow-sm border border-pastel-blue hover:scale-110 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4">
          {state.orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-pastel-grey-dark mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700 mb-2">No orders yet</p>
              <p className="text-sm font-medium text-pastel-grey-dark">Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.orders.map((order) => (
                <div key={order.id} className="bg-pastel-blue-light rounded-xl p-4 border border-pastel-blue shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">Order #{order.id}</h3>
                      <p className="text-sm text-slate-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-pastel-blue">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-pastel-blue-dark"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-slate-700 text-sm">{item.product.name}</p>
                              <p className="text-xs text-slate-600">
                                {item.selectedSize} • {item.selectedColor} • Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-slate-700 text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-pastel-blue-dark font-medium">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Delivery Address</h4>
                      <div className="bg-white p-3 rounded-lg border border-pastel-green">
                        <p className="font-medium text-slate-700">{order.address.name}</p>
                        <p className="text-sm text-slate-600">{order.address.phone}</p>
                        <p className="text-sm text-slate-600">
                          {order.address.addressLine1}, {order.address.addressLine2 && `${order.address.addressLine2}, `}
                          {order.address.city}, {order.address.state} - {order.address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-pastel-blue">
                    <div className="text-lg font-semibold text-slate-700">
                      Total: ${order.total.toFixed(2)}
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button className="bg-pastel-pink-dark text-white px-4 py-2 rounded-lg font-medium hover:bg-pastel-pink transition-all duration-200 text-sm shadow-sm border border-pastel-pink hover:scale-105">
                          Cancel Order
                        </button>
                      )}
                      <button className="bg-pastel-blue-dark text-white px-4 py-2 rounded-lg font-medium hover:bg-pastel-blue transition-all duration-200 text-sm shadow-sm border border-pastel-blue hover:scale-105">
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}