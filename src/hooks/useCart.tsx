import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storedCart = localStorage.getItem("@RocketShoes:cart");
    if (storedCart) {
      return JSON.parse(storedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const found: Product | undefined = cart.find(
        product => product.id === productId
      );

      if (found) {
        updateProductAmount({
          amount: found.amount + 1,
          productId: found.id,
        });
      } else {
        const response = await api.get(`products/${productId}`);
        const productInfo: Product = response.data;

        const newProductInCart = {
          ...productInfo,
          amount: 1,
        };

        setCart([...cart, newProductInCart]);

        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...cart, newProductInCart])
        );
      }
    } catch {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const found: Product | undefined = cart.find(
        product => product.id === productId
      );

      if (!found) {
        toast.error("Erro na remoção do produto");
        return;
      }

      const newCart = cart.filter(product => product.id !== productId);
      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount < 1) {
        toast.error("Erro na alteração de quantidade do produto");
        return;
      }

      const response = await api.get(`stock/${productId}`);
      const stockAvailable: Stock = response.data;

      if (amount > stockAvailable.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const newCart = cart.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            amount,
          };
        } else return product;
      });
      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
