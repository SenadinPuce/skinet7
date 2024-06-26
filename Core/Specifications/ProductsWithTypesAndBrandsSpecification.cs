using Core.Entities;

namespace Core.Specifications
{
    public class ProductsWithTypesAndBrandsSpecification : BaseSpecification<Product>
    {
        public ProductsWithTypesAndBrandsSpecification(ProductSpecParams productParams)
            : base(x => (string.IsNullOrWhiteSpace(productParams.Search) || x.Name.ToLower().Contains(productParams.Search)) &&
            (!productParams.TypeId.HasValue || x.ProductTypeId == productParams.TypeId) &&
            (!productParams.BrandId.HasValue || x.ProductBrandId == productParams.BrandId))

        {
            AddInclude(x => x.ProductType);
            AddInclude(x => x.ProductBrand);
            AddInclude(x => x.Photos);
            AddOrderBy(x => x.Name);
            ApplyPaging(productParams.PageSize * (productParams.PageIndex - 1), productParams.PageSize);

            if (!string.IsNullOrWhiteSpace(productParams.Sort))
            {
                switch (productParams.Sort)
                {
                    case "priceAsc":
                        AddOrderBy(x => x.Price);
                        break;
                    case "priceDesc":
                        AddOrderByDescending(x => x.Price);
                        break;
                    default:
                        AddOrderBy(x => x.Name);
                        break;
                }
            }
        }

        public ProductsWithTypesAndBrandsSpecification(int id) : base(x => x.Id == id)
        {
            AddInclude(x => x.ProductType);
            AddInclude(x => x.ProductBrand);
                 AddInclude(x => x.Photos);
        }
    }
}