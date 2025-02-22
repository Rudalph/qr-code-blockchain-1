// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductTracking {
    struct ProductData {
        string productName;
        string currentLocation;
        uint256 currentDate;
        string serialNumber;
        string uniqueIdentifier;
        string verifierName;
    }
    
    // Mapping to store all product entries by their unique identifiers
    mapping(string => ProductData[]) private productHistory;
    
    // Array to store all unique identifiers
    string[] private allUniqueIdentifiers;
    
    // Event to emit when new data is added
    event ProductDataAdded(
        string productName,
        string currentLocation,
        uint256 currentDate,
        string serialNumber,
        string uniqueIdentifier,
        string verifierName
    );
    
    // Function to add new product data
    function addProductData(
        string memory _productName,
        string memory _currentLocation,
        uint256 _currentDate,
        string memory _serialNumber,
        string memory _uniqueIdentifier,
        string memory _verifierName
    ) public {
        // Create new product data struct
        ProductData memory newData = ProductData({
            productName: _productName,
            currentLocation: _currentLocation,
            currentDate: _currentDate,
            serialNumber: _serialNumber,
            uniqueIdentifier: _uniqueIdentifier,
            verifierName: _verifierName
        });
        
        // Check if this is the first entry for this unique identifier
        if (productHistory[_uniqueIdentifier].length == 0) {
            allUniqueIdentifiers.push(_uniqueIdentifier);
        }
        
        // Add the new data to the history
        productHistory[_uniqueIdentifier].push(newData);
        
        // Emit event
        emit ProductDataAdded(
            _productName,
            _currentLocation,
            _currentDate,
            _serialNumber,
            _uniqueIdentifier,
            _verifierName
        );
    }
    
    // Function to retrieve product history by unique identifier
    function getProductHistory(string memory _uniqueIdentifier) 
        public 
        view 
        returns (ProductData[] memory) 
    {
        require(productHistory[_uniqueIdentifier].length > 0, "No data found for this identifier");
        
        // Get all entries for this unique identifier
        ProductData[] memory history = productHistory[_uniqueIdentifier];
        
        // Sort the history array by date (bubble sort)
        ProductData[] memory sortedHistory = new ProductData[](history.length);
        for (uint i = 0; i < history.length; i++) {
            sortedHistory[i] = history[i];
        }
        
        for (uint i = 0; i < sortedHistory.length - 1; i++) {
            for (uint j = 0; j < sortedHistory.length - i - 1; j++) {
                if (sortedHistory[j].currentDate > sortedHistory[j + 1].currentDate) {
                    ProductData memory temp = sortedHistory[j];
                    sortedHistory[j] = sortedHistory[j + 1];
                    sortedHistory[j + 1] = temp;
                }
            }
        }
        
        return sortedHistory;
    }
    
    // Function to get all unique identifiers
    function getAllUniqueIdentifiers() public view returns (string[] memory) {
        return allUniqueIdentifiers;
    }
    
    // Function to get the count of entries for a specific unique identifier
    function getEntryCount(string memory _uniqueIdentifier) public view returns (uint256) {
        return productHistory[_uniqueIdentifier].length;
    }
}