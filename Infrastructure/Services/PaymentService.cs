using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.Extensions.Configuration;
using Stripe;
using Product = Core.Entities.Product;

namespace Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IBasketRepository _basketRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _config;
        public PaymentService(IBasketRepository basketRepository, IUnitOfWork unitOfWork,
            IConfiguration config)
        {
            _config = config;
            _unitOfWork = unitOfWork;
            _basketRepository = basketRepository;
        }

        public async Task<CustomerBasket> CreateOrUpdatePaymentIntent(string basketId)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var basket = await _basketRepository.GetBasketAsync(basketId);

            if (basket == null) return null;

            var spec = new OrderByPaymentIntentIdSpecification(basket.PaymentIntentId);
            var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

            var items = new List<OrderItem>();

            var shippingPrice = 0m;

            if (basket.DeliveryMethodId.HasValue)
            {
                var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync((int)basket.DeliveryMethodId);
                shippingPrice = deliveryMethod.Price;

                if (order != null) order.DeliveryMethod = deliveryMethod;
            }

            foreach (var item in basket.Items)
            {
                var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
                var itemOrdered = new ProductItemOrdered(productItem.Id, productItem.Name, productItem.PictureUrl);
                var orderItem = new OrderItem(itemOrdered, productItem.Price, item.Quantity);
                items.Add(orderItem);
            }

            if (order != null)
            {

                foreach (var existingItem in order.OrderItems)
                {
                    _unitOfWork.Repository<OrderItem>().Delete(existingItem);
                }
                order.OrderItems = items;
                _unitOfWork.Repository<Order>().Update(order);
                await _unitOfWork.Complete();
            }

            var service = new PaymentIntentService();

            PaymentIntent intent;

            if (string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)items.Sum(i => i.Quantity * (i.Price * 100)) +
                        (long)shippingPrice * 100,
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" }
                };

                intent = await service.CreateAsync(options);
                basket.PaymentIntentId = intent.Id;
                basket.ClientSecret = intent.ClientSecret;
            }
            else
            {
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = (long)items.Sum(i => i.Quantity * (i.Price * 100)) +
                        (long)shippingPrice * 100
                };

                await service.UpdateAsync(basket.PaymentIntentId, options);

            }

            return await _basketRepository.UpdateBasketAsync(basket);
        }

        public async Task<Order> UpdateOrderPaymentFailed(string paymentIntentId)
        {
            var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
            var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return null;

            order.Status = OrderStatus.PaymentFailed;
            await _unitOfWork.Complete();

            return order;
        }

        public async Task<Order> UpdateOrderPaymentSucceeded(string paymentIntentId)
        {
            var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
            var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return null;

            order.Status = OrderStatus.PaymentReceived;
            await _unitOfWork.Complete();

            return order;
        }
    }
}