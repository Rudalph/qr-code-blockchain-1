// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {
    struct Product {
        string productName;
        string batchNumber;
        string location;
        string date;
        string serialNumber;
        uint256 price;
        uint256 weight;
        string manufacturerName;
        string url;
        string hashValue;
    }

    // Mapping of unique identifier (productName_serialNumber) to Product struct
    mapping(string => Product) private products;

    // Event for logging product addition
    event ProductAdded(string indexed identifier, string productName, string serialNumber);

    // Function to add a new product
    function addProduct(
        string memory productName,
        string memory batchNumber,
        string memory location,
        string memory date,
        string memory serialNumber,
        uint256 price,
        uint256 weight,
        string memory manufacturerName,
        string memory url,
        string memory hashValue
    ) public {
        string memory identifier = string(abi.encodePacked(productName, "_", serialNumber));
        require(bytes(products[identifier].serialNumber).length == 0, "Product already exists");

        products[identifier] = Product(
            productName,
            batchNumber,
            location,
            date,
            serialNumber,
            price,
            weight,
            manufacturerName,
            url,
            hashValue
        );

        emit ProductAdded(identifier, productName, serialNumber);
    }

    // Function to retrieve a product by unique identifier
    function getProduct(string memory identifier) public view returns (
        string memory productName,
        string memory batchNumber,
        string memory location,
        string memory date,
        string memory serialNumber,
        uint256 price,
        uint256 weight,
        string memory manufacturerName,
        string memory url,
        string memory hashValue
    ) {
        require(bytes(products[identifier].serialNumber).length > 0, "Product not found");

        Product memory product = products[identifier];
        return (
            product.productName,
            product.batchNumber,
            product.location,
            product.date,
            product.serialNumber,
            product.price,
            product.weight,
            product.manufacturerName,
            product.url,
            product.hashValue
        );
    }
}
