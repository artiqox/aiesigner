function setReview(num, name, value ) {
  $("#review_" + num).text(name);
  $("#review_val" + num).val(value);
}

function extractBytesData( bytes ) { 
  var type = bytes[0];
  var subtype = bytes[1] % 16;
  var sender = getAccountIdFromPublicKey(converters.byteArrayToHexString(bytes.slice(8, 8+32)), true);
  var r = new NxtAddress();
  r.set(byteArrayToBigInteger(bytes.slice(40, 48)).toString());
  var recipient = r.toString();

  var amount = byteArrayToBigInteger(bytes.slice(48, 48+8));

  var fee = byteArrayToBigInteger(bytes.slice(56, 56+8));

  var flags = converters.byteArrayToSignedInt32(bytes.slice(160, 160+4));
  var rest = [];
  if(bytes.length > 176) rest = bytes.slice(176);
  var msg = [];
  var typeName = [];

  if(type == 0) {
    if(subtype == 0){
      typeName = "Ordinary Payment";
      setReview(1, "Type", typeName);
      setReview(2, "Sender", sender);
      setReview(3, "Recipient", recipient);
      setReview(4, "Amount", amount/100000000 + " AIE");
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length) msg = rest;
    }
  }

  else if(type == 1) {
    if(subtype == 0)
    {
      typeName = "Arbitrary Message";
      setReview(1, "Type", typeName);
      setReview(2, "Sender", sender);
      setReview(3, "Recipient", recipient);
      setReview(4, "Fee", fee/100000000 + " AIE");
      if(rest.length) msg = rest;
    }
    else if(subtype == 1) 
    {
      typeName = "Alias Assignment";
      setReview(1, "Type", typeName);
      setReview(2, "Registrar", sender);
      var alias = converters.byteArrayToString(rest.slice(2, rest[1]+2));
      setReview(3, "Alias Name", alias);
      setReview(4, "Fee", fee/100000000 + " AIE");
      var data = converters.byteArrayToString(rest.slice(4+rest[1], 4+rest[1]+bytesWord([rest[2+rest[1]], rest[3+rest[1]]])));
      if(rest.length > 2+rest[1]+bytesWord(rest.slice(2+rest[1], 4+rest[1]))) msg = rest.slice(2+rest[1]+bytesWord(rest.slice(2+rest[1], 4+rest[1])));
    }
    else if(subtype == 2)
    {
      typeName = "Poll Creation"; //  not yet
      setReview(1, "Type", typeName);
      setReview(2, 'Unsupported', '');
    }
    else if(subtype == 3) 
    {
      typeName = "Vote Casting"; // not yet
      setReview(1, "Type", typeName);
      setReview(2, 'Unsupported', '');
    }
    else if(subtype == 4)
    {
      typeName = "Hub Announcement"; //  what even is this?
      setReview(1, "Type", typeName);
      setReview(2, 'Unsupported', '');
    } 
    else if(subtype == 5) 
    {
      typeName = "Account Info";
      setReview(1, "Type", typeName);
      setReview(2, "Account", sender);
      var alias = converters.byteArrayToString(rest.slice(2, rest[1]+2));
      setReview(3, "Name", alias);
      setReview(4, "Fee", fee/100000000 + " AIE");
      var data = converters.byteArrayToString(rest.slice(4+rest[1], 4+rest[1]+bytesWord([rest[2+rest[1]], rest[3+rest[1]]])));
      if(rest.length > 2+rest[1]+bytesWord(rest.slice(2+rest[1], 4+rest[1]))) msg = rest.slice(2+rest[1]+bytesWord(rest.slice(2+rest[1], 4+rest[1])));
    }
    else if(subtype == 6) 
    {
      typeName = "Alias Sell";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var alias = converters.byteArrayToString(rest.slice(2, rest[1]+2));
      var target = "";
      if (recipient == "AIE-MRCC-2YLS-8M54-3CMAJ") { setReview(3, "Buyer", "Anyone"); target = "anyone"; }
      else { setReview(3, "Buyer", recipient); target = recipient; }
      setReview(4, "Alias Name", alias);
      var price = byteArrayToBigInteger(rest.slice(2 + rest[1], 10 + rest[1])).toString();
      price = price/100000000;
      setReview(5, "Sell Price", price);
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 10+rest[1]) msg = rest.slice(10+rest[1]);
    }
    else if(subtype == 7) 
    {
      typeName = "Alias Buy";
      setReview(1, "Type", typeName);
      setReview(2, "Buyer", sender);
      setReview(3, "Seller", recipient);
      var alias = converters.byteArrayToString(rest.slice(2, rest[1]+2));
      setReview(4, "Alias", alias);
      setReview(5, "Buy Price", amount/100000000 + " AIE");
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 2+rest[1]) msg = rest.slice(2+rest[1]);
    }
  } // end else if type == 1

  else if(type == 2) {
    if(subtype == 0) 
    {
      typeName = "Asset Issuance";
      setReview(1, "Type", typeName);
      setReview(2, "Issuer", sender);
      var name = converters.byteArrayToString(rest.slice(2,rest[1]+2));
      setReview(3, "Asset Name", name);
      var data = converters.byteArrayToString(rest.slice(4+rest[1], 4+rest[1]+bytesWord([rest[2+rest[1]], rest[3+rest[1]]])));
      var newpos = 4+rest[1]+bytesWord([rest[2+rest[1]], rest[3+rest[1]]]);
      var units = byteArrayToBigInteger(rest.slice(newpos, newpos+8));
      var decimals = rest[newpos+8];
      units = units/Math.pow(10, decimals);
      setReview(4, "Units", units);
      setReview(5, "Decimals", decimals);
      setReview(6, "Fee", fee/100000000 + " AIE");
    }
    else if(subtype == 1) 
    {
      typeName = "Asset Transfer";
      setReview(1, "Type", typeName);
      setReview(2, "Sender", sender);
      setReview(3, "Recipient", recipient);
      var assetId = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(4, "Asset Id", assetId);
      var amount = byteArrayToBigInteger(rest.slice(1+8, 1+16)).toString();
      setReview(5, "Amount", amount + " QNT");
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 17) msg = rest.slice(17);
    }
    else if(subtype == 2) 
    {
      typeName = "Ask Order Placement";
      setReview(1, "Type", typeName);
      setReview(2, "Trader", sender);
      var assetId = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Asset Id", assetId);
      var amount = byteArrayToBigInteger(rest.slice(1+8, 1+16)).toString();
      setReview(4, "Amount", amount + " QNT");
      var price = byteArrayToBigInteger(rest.slice(1+16, 1+24)).toString();
      setReview(5, "Price", price + " NQT");
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 25) msg = rest.slice(25);
    }
    else if(subtype == 3) 
    {
      typeName = "Bid Order Placement";
      setReview(1, "Type", typeName);
      setReview(2, "Trader", sender);
      var assetId = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Asset Id", assetId);
      var amount = byteArrayToBigInteger(rest.slice(1+8, 1+16)).toString();
      setReview(4, "Amount", amount + " QNT");
      var price = byteArrayToBigInteger(rest.slice(1+16, 1+24)).toString();
      setReview(5, "Price", price + " NQT");
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 25) msg = rest.slice(25);
    }
    else if(subtype == 4) 
    {
      typeName = "Ask Order Cancellation";
      setReview(1, "Type", typeName);
      setReview(2, "Trader", sender);
      var order = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Order Id", order);
      setReview(4, "Fee", fee/100000000 + " AIE");
      if(rest.length > 9) msg = rest.slice(9);
    }
    else if(subtype == 5)
    {
      typeName = "Bid Order Cancellation";
      setReview(1, "Type", typeName);
      setReview(2, "Trader", sender);
      var order = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Order Id", order);
      setReview(4, "Fee", fee/100000000 + " AIE");
      if(rest.length > 9) msg = rest.slice(9);

    }
  } // end else if type == 2

  else if(type == 3) {
    if(subtype == 0) 
    {
      typeName = "Goods Listing";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var name = converters.byteArrayToString(rest.slice(3,rest[1]+2));
      setReview(3, "Good Name", name);
      var data = converters.byteArrayToString(rest.slice(4+rest[1], 4+rest[1]+bytesWord([rest[2+rest[1]], rest[3+rest[1]]])));
      var newpos = 4+rest[1]+bytesWord([rest[2+rest[1]], rest[3+rest[1]]]);
      var tags = converters.byteArrayToString(rest.slice(newpos+2, newpos+2+bytesWord([rest[newpos],rest[newpos+1]])));
      newpos = newpos+2+bytesWord([rest[newpos],rest[newpos+1]]);
      setReview(4, "Tags", tags);
      var amount = converters.byteArrayToSignedInt32(rest.slice(newpos, newpos+4));
      var price = byteArrayToBigInteger(rest.slice(newpos+4, newpos+12)).toString();
      setReview(5, "Amount (price)", amount + "(" + price/100000000 + " AIE)");
      setReview(6, "Fee", fee/100000000 + " AIE");
    }
    else if(subtype == 1) 
    {
      typeName = "Goods Delisting";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var order = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Item Id", order);
      setReview(4, "Fee", fee/100000000 + " AIE");
      if(rest.length > 9) msg = rest.slice(9);
    }
    else if(subtype == 2) 
    {
      typeName = "Price Change";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var goodid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Item Id", goodid);
      var newprice = byteArrayToBigInteger(rest.slice(1+8, 1+8+8)).toString();
      setReview(4, "New Price", newprice/100000000 + " AIE");
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 1+8+8) msg = rest.slice(17);
    }
    else if(subtype == 3) 
    {
      typeName = "Quantity Change";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var goodid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Item Id", goodid);
      var chg = converters.byteArrayToSignedInt32(rest.slice(1+8, 1+8+4));
      if(chg < 0) setReview(4, "Decrease By", -chg);
      else setReview(4, "Increase By", chg);
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 1+8+4) msg = rest.slice(13);
    }
    else if(subtype == 4)
    {
      typeName = "Purchase";
      setReview(1, "Type", typeName);
      setReview(2, "Buyer", sender);
      var goodid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Item Id", goodid);
      var qnt = byteArrayToBigInteger(rest.slice(1+8, 1+8+4)).toString();
      setReview(4, "Quantity", qnt);
      var price = byteArrayToBigInteger(rest.slice(1+8+4, 1+16+4)).toString();
      setReview(5, "Price", price/100000000 + " AIE");
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 1+16+8) msg = rest.slice(25);
    }
    else if(subtype == 5)
    {
      typeName = "Delivery";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var goodid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Item Id", goodid);
      var discount = byteArrayToBigInteger(rest.slice(rest.length-8)).toString();
      setReview(4, "Discount", discount/100000000 + " AIE");
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 1+8) msg = rest.slice(9);
    
    }
    else if(subtype == 6) 
    {
      typeName = "Feedback";
      setReview(1, "Type", typeName);
      setReview(2, "User", sender);
      setReview(3, "Seller", recipient);
      var goodid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(4, "Item Id", goodid);
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 1+8) msg = rest.slice(9);
    }
    else if(subtype == 7) 
    {
      typeName = "Refund";
      setReview(1, "Type", typeName);
      setReview(2, "Seller", sender);
      var goodid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Purchase Id", goodid);
      var discount = byteArrayToBigInteger(rest.slice(1+8,1+16)).toString();
      setReview(4, "Refund Amount", discount/100000000 + " AIE");
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 1+16) msg = rest.slice(17);
    }
  }

  else if(type == 4)
  {
    if(subtype == 0)
    {
      typeName = "Balance Leasing";
      setReview(1, "Type", typeName);
      setReview(2, "Lessor", sender);
      var lease = bytesWord(rest.slice(1,3));
      setReview(3, "Length", lease + " blocks");
      setReview(4, "Fee", fee/100000000 + " AIE");
      if(rest.length > 3) msg = rest.slice(3);
    } 
  }


  else if(type == 5)
  {
    if(subtype == 0)
    {
      typeName = "Issue Currency";
    }
    else if(subtype == 1)
    {
      typeName = "Reserve Increase";
      setReview(1, "Type", typeName);
      setReview(2, "Reserver", sender);
      var assetid = converters.byteArrayToString(rest.slice(1, 1+8));
      setReview(3, "Currency Id", assetId);
      var amount = byteArrayToBigInteger(rest.slice(1+8, 1+16)).toString();
      setReview(4, "Amount per Unit", amount + " AIE");
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 17) msg = rest.slice(17);
    }
    else if(subtype == 2)
    {
      typeName = "Reserve Claim";
    }
    else if(subtype == 3)
    {
      typeName = "Currency Transfer";
      setReview(1, "Type", typeName);
      setReview(2, "Sender", sender);
      setReview(3, "Recipient", recipient);
      var ms = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(4, "Currency Id", ms);
      var amount = byteArrayToBigInteger(rest.slice(1+8, 1+16)).toString();
      setReview(5, "Amount", amount + " QNT");
      setReview(6, "Fee", fee/100000000 + " AIE");
      if(rest.length > 17) msg = rest.slice(17);
    }
    else if(subtype == 4)
    {
      typeName = "Exchange Offer";
    }
    else if(subtype == 5)
    {
      typeName = "Exchange Buy";
    }
    else if(subtype == 6)
    {
      typeName = "Exchange Sell";
    }
    else if(subtype == 7)
    {
      typeName = "Mint Currency";
      setReview(1, "Type", typeName);
      setReview(2, "Minter", sender);
      var assetid = byteArrayToBigInteger(rest.slice(1, 1+8)).toString();
      setReview(3, "Currency Id", assetId);
      var amount = byteArrayToBigInteger(rest.slice(1+16, 1+24)).toString();
      setReview(4, "Amount To Mint", amount + " Units");
      setReview(5, "Fee", fee/100000000 + " AIE");
      if(rest.length > 16+16+1) msg = rest.slice(33);
    }
    else if(subtype == 8)
    {
      typeName = "Delete Currency";
    }
  }	


  var message = getModifierBit(flags, 0);
  if ( message && msg.length ) {
    var len = bytesWord([msg[1],msg[2]]);
    var str = converters.byteArrayToString(msg.slice(5,5+len));
    msg = msg.slice(3+len);
    setReview(7, "Message", str );
  }

} // end function

function getModifierBit(target, position) {
	return (target >> position)%2;
}
