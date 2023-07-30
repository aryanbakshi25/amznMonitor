import got from 'got';
import HTMLParser from 'node-html-parser';
import promptSync from 'prompt-sync';
const prompt = promptSync();
import { Webhook, MessageBuilder } from 'discord-webhook-node';



//https://www.amazon.com/Bedroom-Bluetooth-Changing-Christmas-Decoration/dp/B09BJHWQHZ?pd_rd_w=YgSjl&content-id=amzn1.sym.deffa092-2e99-4e9f-b814-0d71c40b24af&pf_rd_p=deffa092-2e99-4e9f-b814-0d71c40b24af&pf_rd_r=3F137CP5H9Y3MGX39Z0Z&pd_rd_wg=9KD9p&pd_rd_r=90bd687d-5f7b-46ff-ac25-443c3f561208&pd_rd_i=B09BJHWQHZ&ref_=pd_bap_d_grid_rp_0_1_t&th=1
//https://www.amazon.com/Damn-Exclusive-Limited-Translucent-Colored/dp/B08JX1D2ZF/ref=sr_1_11?crid=1YTR1GIHFQXP2&keywords=kendrick+lamar+vinyl&qid=1674291848&refinements=p_n_availability%3A2661601011&rnid=2661599011&sprefix=kendrick+%2Caps%2C136&sr=8-11
// Sample Out of Stock Item -> https://www.amazon.com/Masters-Universe-Masterverse-Collectible-Articulations/dp/B0BCN47F77/ref=sr_1_62?crid=16D2A7NNNT87Q&keywords=Masters+of+the+Universe+Castle+Grayskull+Giftset+with+bonus+figures&qid=1690699957&refinements=p_n_availability%3A2661601011&rnid=2661599011&sprefix=masters+of+the+universe+castle+grayskull+giftset+with+bonus+figures%2Caps%2C87&sr=8-62

const hook = new Webhook("https://discord.com/api/webhooks/1135098009504469052/Q2GNfNG6jN4PiTD69xo041KkwGNvOYhFxWFxAxu8FOoGooX0EGEzAf6ESW9zBJRMGcWy");
 
const embed = new MessageBuilder()
.setTitle('Amazon Stock Status Monitor')
.setColor('#90ee90')
.setTimestamp()

async function Monitor(productLink){
    var myHeaders = {
        'connection': 'keep-alive',
        'sec-ch-ua': `" Not;A Brand";v= "99", "Google Chrome";v="91", "Chromium";v="91"`,
        'sec-ch-ua-mobile': '70',
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'accept': 'text/html, application/xhtml+ml, application/xml; q-0.9, image/avif, image/webp, image/apng, */*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US, en; q=0.9',
        'rtt': 50,
        'ect': '4g',
        'downlink': 10
    }

    const response = await got(productLink, {
        headers: myHeaders
    });

    if(response && response.statusCode == 200){
        let root = HTMLParser.parse(response.body);
        let availabilityDiv = root.querySelector('#availability');
        if(availabilityDiv){
            let productImageURL = root.querySelector('#landingImage').getAttribute('src');
            let productName = productLink.substring(productLink.indexOf('com/') + 4, productLink.indexOf('/dp'));
            let stockText = availabilityDiv.childNodes[1].innerText.toLowerCase();
            if(stockText.includes('out of stock')){
                embed.setColor('#FF0000')
                embed.setThumbnail(productImageURL);
                embed.addField(productName, productLink, true);
                embed.addField('Availability', 'OUT OF STOCK', false);
                hook.send(embed);
                console.log(productName + ' OUT OF STOCK');
            }else{
                embed.setThumbnail(productImageURL);
                embed.addField(productName, productLink, true);
                embed.addField('Availability', 'IN STOCK', false);
                hook.send(embed);
                console.log(productName + ' IN STOCK');
            }
        }
    }

    await new Promise(r => setTimeout(r, 8000));
    Monitor(productLink);
    return false;
}

async function Run(){
    var productLinks = prompt("Enter links to monitor (separate by comma): ");
    
    var productLinksArr = productLinks.split(',');

    for (var i = 0; i < productLinksArr.length; i++){
        productLinksArr[i] = productLinksArr[i].trim();
    }
    
    var monitors = []; //array of Promises

    productLinksArr.forEach(link => {
        var p = new Promise((resolve, reject) => {
            Monitor(link);
        }).catch(err => console.log(err));

        monitors.push(p);
    });
    
    console.log('Now monitoring ' + productLinksArr.length + ' item(s)');
    await Promise.all(monitors);

}




Run();