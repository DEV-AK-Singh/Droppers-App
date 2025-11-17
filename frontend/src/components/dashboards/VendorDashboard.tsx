import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ordersAPI } from "../../services/api";
import { type Order, type DashboardStats, type CreateOrderData, OrderStatus, type ServerToClientEvents, type ClientToServerEvents } from "../../types/auth";
import { VendorStats } from "./VendorStats";
import { CreateOrderForm } from "../orders/CreateOrderForm";
import { OrderList } from "../orders/OrderList";
import { io, Socket } from "socket.io-client";

const { VITE_NODE_ENV, 
  VITE_BACKEND_URL_DEV,
  VITE_BACKEND_URL_PROD } = import.meta.env;

const BACKEND_URL = `${VITE_NODE_ENV === 'production' ? VITE_BACKEND_URL_PROD : VITE_BACKEND_URL_DEV}`;

export const VendorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string>("");
  const [socket, setSocket] = useState<Socket<
      ServerToClientEvents,
      ClientToServerEvents
    > | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, statsData] = await Promise.all([
        ordersAPI.getVendorOrders(),
        ordersAPI.getVendorStats(),
      ]);

      setOrders(ordersData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Socket.io setup for real-time updates
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Vendor connected to server via Socket.io");

      // Join vendor's personal room for order updates
      if (user?.id) {
        newSocket.emit("join:vendor", user.id);
        console.log(`Vendor ${user.id} joined vendor room`);
      }
    });

    // Listen for delivery status updates (including order acceptance)
    newSocket.on("delivery:status-changed", (data: { order: Order }) => {
      console.log("📢 Vendor received delivery:status-changed:", data);

      if (data.order) {
        // Update the specific order with new status and delivery partner info
        setOrders((prev) =>
          prev.map((order) =>
            order.id === data.order.id
              ? {
                  ...data.order,
                  status: data.order.status,
                  dropperId: data.order.dropperId,
                  dropper: data.order.dropper,
                }
              : order
          )
        );

        console.log(
          `🔄 Vendor: Order ${data.order.id} updated to status: ${data.order.status}`
        );

        // Refresh stats to get updated counts
        loadStats();
      } else {
        console.error(
          "❌ Vendor: No order data in delivery:status-changed event"
        );
      }
    });

    // Listen for delivery completion
    newSocket.on("delivery:completed", (data: { order: Order }) => {
      console.log("📢 Vendor received delivery:completed:", data);

      if (data.order) {
        // Update the specific order as delivered
        setOrders((prev) =>
          prev.map((order) =>
            order.id === data.order.id
              ? {
                  ...order,
                  status: OrderStatus.DELIVERED,
                  dropper: data.order.dropper,
                }
              : order
          )
        );

        console.log(`✅ Vendor: Order ${data.order.id} marked as delivered`);

        // Refresh stats
        loadStats();
      } else {
        console.error("❌ Vendor: No order data in delivery:completed event");
      }
    });

    // Debug: Log all socket events
    newSocket.onAny((eventName, ...args) => {
      console.log(`🔍 Vendor Socket Event: ${eventName}`, args);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Vendor disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Vendor socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await ordersAPI.getVendorStats();
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleCreateOrder = async (orderData: CreateOrderData) => {
    try {
      setCreatingOrder(true);
      setError("");

      const newOrder = await ordersAPI.createOrder(orderData);

      // Notify via socket about new order
      if (socket) {
        socket.emit("order:created", newOrder);
      }

      // Update local state
      setOrders((prev) => [newOrder, ...prev]);
      await loadStats();

      setShowCreateForm(false);

      console.log("✅ Order created successfully!");
    } catch (err: any) {
      console.error("Order creation failed:", err);
      setError(err.message || "Failed to create order");
      throw err;
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setError("");

      const cancelledOrder = await ordersAPI.cancelOrder(orderId);

      // Notify via socket about cancellation
      if (socket && user?.id) {
        socket.emit("order:cancelled", {
          orderId,
          vendorId: user.id,
        });
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? cancelledOrder : order))
      );

      await loadStats();
      console.log("✅ Order cancelled successfully");
    } catch (err: any) {
      console.error("Order cancellation failed:", err);
      setError(err.message || "Failed to cancel order");
    }
  };

  const refreshData = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🚚 Droppers</h1>
              <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                VENDOR DASHBOARD
              </span>
              <div className="ml-4 flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    socket ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <span className="ml-2 text-xs text-gray-500">
                  {socket ? "Live" : "Offline"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError("")}
                    className="text-red-800 hover:text-red-900"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Vendor Dashboard
              </h2>
              <p className="text-gray-600">
                Manage your delivery orders and track their status in real-time
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                + Create Order
              </button>
            </div>
          </div>

          {/* Stats */}
          <VendorStats stats={stats} loading={loading} />

          {/* Orders Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Orders
              </h3>
              <p className="text-sm text-gray-500">
                {orders.length} order{orders.length !== 1 ? "s" : ""} total
              </p>
            </div>

            <OrderList
              orders={orders}
              loading={loading}
              onCancel={handleCancelOrder}
              emptyMessage="No orders created yet. Create your first order to get started!"
            />
          </div>

          {/* Real-time Status Footer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  Live Updates Active
                </span>
              </div>
              <div className="text-sm text-blue-700">
                You'll see real-time updates when delivery partners accept and
                update your orders
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateForm && (
        <CreateOrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowCreateForm(false)}
          loading={creatingOrder}
        />
      )}
    </div>
  );
};
