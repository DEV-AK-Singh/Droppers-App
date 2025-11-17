import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ordersAPI } from "../../services/api";
import { type Order, OrderStatus, type DeliveryStats, type ClientToServerEvents, type ServerToClientEvents } from "../../types/auth";
import { DeliveryStats as DeliveryStatsComponent } from "./DeliveryStats";
import { AvailableOrders } from "../delivery/AvailableOrders";
import { MyDeliveries } from "../delivery/MyDeliveries";
import { io, Socket } from "socket.io-client";

export const DeliveryDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"available" | "my-deliveries">(
    "available"
  );
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    activeDeliveries: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [availableData, deliveriesData, statsData] = await Promise.all([
        ordersAPI.getAvailableOrders(),
        ordersAPI.getMyDeliveries(),
        ordersAPI.getDeliveryStats(),
      ]);

      setAvailableOrders(availableData);
      setMyDeliveries(deliveriesData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Socket.io setup
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Delivery partner connected to server via Socket.io");

      // Join available orders room
      newSocket.emit("join:available-orders");

      // Join delivery partner's personal room
      if (user?.id) {
        newSocket.emit("join:dropper", user.id);
      }
    });

    // Listen for new orders from vendors
    newSocket.on("order:created", (newOrder: Order) => {
      console.log("New order available:", newOrder);
      // Add new order to available orders
      setAvailableOrders((prev) => [newOrder, ...prev]);
    });

    // Listen for order acceptance by other delivery partners
    newSocket.on("order:accepted", (data: { orderId: string }) => {
      console.log("Order accepted by another delivery partner:", data); 
      // Remove the accepted order from available orders
      setAvailableOrders((prev) =>
        prev.filter((order) => order.id !== data.orderId)
      );
    });

    // Listen for order cancellations from vendors
    newSocket.on("order:cancelled", (data: { orderId: string }) => {
      console.log("Order cancelled by vendor:", data);
      // Remove cancelled order from available orders
      setAvailableOrders((prev) =>
        prev.filter((order) => order.id !== data.orderId)
      );
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Delivery partner disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setAcceptingOrderId(orderId);
      setError("");

      // Notify via socket first
      if (socket) {
        socket.emit(
          "order:accept",
          orderId,
          (success: boolean, message?: string) => {
            if (!success) {
              setError(message || "Failed to accept order");
              setAcceptingOrderId(null);
              return;
            }
          }
        );
      }

      // Then make API call
      const acceptedOrder = await ordersAPI.acceptOrder(orderId);

      // Update local state
      setAvailableOrders((prev) =>
        prev.filter((order) => order.id !== orderId)
      );
      setMyDeliveries((prev) => [acceptedOrder, ...prev]);

      // Refresh stats
      const updatedStats = await ordersAPI.getDeliveryStats();
      setStats(updatedStats);

      console.log("✅ Order accepted successfully!");

      // Switch to my deliveries tab
      setActiveTab("my-deliveries");
    } catch (err: any) {
      console.error("Order acceptance failed:", err);
      setError(err.message || "Failed to accept order");
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      setError("");

      // Notify via socket
      if (socket) {
        socket.emit("delivery:status-update", { orderId, status });
      }

      const updatedOrder = await ordersAPI.updateDeliveryStatus(
        orderId,
        status
      );

      // Update local state
      setMyDeliveries((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );

      // Refresh stats if order was delivered
      if (status === OrderStatus.DELIVERED) {
        const updatedStats = await ordersAPI.getDeliveryStats();
        setStats(updatedStats);
      }

      console.log(`✅ Delivery status updated to ${status}`);
    } catch (err: any) {
      console.error("Status update failed:", err);
      setError(err.message || "Failed to update delivery status");
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      setError("");

      // Notify via socket
      if (socket) {
        socket.emit("delivery:completed", { orderId });
      }

      const completedOrder = await ordersAPI.completeDelivery(orderId);

      // Update local state
      setMyDeliveries((prev) =>
        prev.map((order) => (order.id === orderId ? completedOrder : order))
      );

      // Refresh stats
      const updatedStats = await ordersAPI.getDeliveryStats();
      setStats(updatedStats);

      console.log("✅ Delivery completed successfully!");
    } catch (err: any) {
      console.error("Delivery completion failed:", err);
      setError(err.message || "Failed to complete delivery");
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
              <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                DELIVERY PARTNER
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
                Delivery Dashboard
              </h2>
              <p className="text-gray-600">
                Accept orders and manage your deliveries in real-time
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <DeliveryStatsComponent stats={stats} loading={loading} />

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("available")}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "available"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>📦 Available Orders</span>
                    {availableOrders.length > 0 && (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        {availableOrders.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("my-deliveries")}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "my-deliveries"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚗 My Deliveries</span>
                    {myDeliveries.length > 0 && (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        {myDeliveries.length}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "available" ? (
                <AvailableOrders
                  orders={availableOrders}
                  loading={loading}
                  onAcceptOrder={handleAcceptOrder}
                  acceptingOrderId={acceptingOrderId}
                />
              ) : (
                <MyDeliveries
                  deliveries={myDeliveries}
                  loading={loading}
                  onStatusUpdate={handleStatusUpdate}
                  onCompleteDelivery={handleCompleteDelivery}
                />
              )}
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Live Updates Active
                </span>
              </div>
              <div className="text-sm text-green-700">
                You'll receive real-time notifications for new orders and status
                changes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
