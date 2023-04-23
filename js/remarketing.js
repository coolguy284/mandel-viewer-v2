let REMARKETING_DATA = {
  '<strong>Summary</strong>':
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; To ensure intent is properly distingished from custom intent, standard practices of standard remarketing must be used. Optionally, dynamic remarketing can be used to speed up the process, although it is important to ensure similar audiences from dynamic remarketing. To achieve this, the affinity must be increased, and the custom affinity decreased, resulting in a decrease in cost per click but not enhanced cost per click or target cost per click. The return on ad spend must be carefully matched with the net profit value, and this is easier to remarket if target return on ad spend is used. The marketing funnel is an important system of sequencing frameworks, and clarifies the affinity of Ads Creative Studio versus Video Creation Tools in Google Ads. The ad creative must be used to build sequential assets powered by technology or funnel, which will improve the view through rate and lift. The tCPI, tCPA, and tROAS must be optimized for the marketing funnel, accounting for performance fluctuations in the target cost per interaction, target cost per acquisition, and target return on ad spend. This will increase the KPIs and thus the view through rate and lift by around 30%. Cost-per-acquisition (CPA) performance targets can be used to match the target impression share, and maximize conversions versus maximize conversion value that will occur with native and non native inventory.',
  'intent':
    'NOT to be confused with "custom intent", "intent" is very useful for judging a customer\'s intent.',
  'custom intent':
    'NOT to be confused with "intent", "custom intent" is an extremely customizable way to judge the mass of a proton.',
  'standard remarketing':
    'The most standard of remarketing strategies, everyone starts their Google Ads journey with at least one of these.',
  'dynamic remarketing':
    'A slight upgrade to "standard remarketing", this more dynamic form of remarketing can be used to slightly increase ad lift and tROAS (but NOT tCPA)',
  'similar audiences from dynamic remarketing':
    'Audiences can be hard to come by, so it\'s best to keep them similar for simpllicity\'s sake.',
  'affinity':
    '"Affinity" can help you be more affline.',
  'custom affinity':
    '"Custom affinity" eases the transition from Ads Creative Studio to Video Creation Tools on Google Ads, as long as Google Analytics is used.',
  'cost per click':
    'The square root of the square of the total cost, divided by the total number of clicks.',
  'enhanced cost per click':
    'Formed by crafting "cost per click" with 8 redstone on all sides, this variant uses 50% less EU/t.',
  'target cost per click':
    'The long form of "tCPC"',
  'return on ad spend':
    'The maximum return that you can reasonably get on ad spend (and DEFINITELY not just "profit").',
  'target return on ad spend':
    'The target return that should be attained on ad spend (and DEFINITELY not just the "target profit")',
  'marketing funnel':
    'Now with four stages, to snare customers more effectively!',
  'sequencing frameworks':
    'Using something along the lines of batch or zsh, things can be sequenced effectively.',
  'ads creative studio vs video creation tools in google ads':
    'You have 10 seconds left. Time is running out.',
  'ad creative':
    'Is it ad creative or creative ad? That is the question.',
  'build sequential assets powered by technology or funnel':
    'To properly build assets, make sure that all programming libraries are installed correctly. And use cmake.',
  'view through rate':
    'The approximate percentage of light that makes it through a medium with occluency factor of 0.',
  'lift':
    'If you\'re ever feeling down...',
  'tCPI, tCPA, tROAS':
    'These three target values will help you reach your target<sup>tm</sup>.',
  'performance fluctuations':
    'The performance might be high or it might be low. Life happens, deal with it.',
  'target cost per interaction':
    'If the tCPI is not met, firing will occur.',
  'target cost per acquisiton':
    'If the tCPA is not got, falling will occur.',
  'target return on ad spend':
    'If the tROAS is not lit, appearance will appear.',
  'KPIs':
    'It is sometimes hard to reach key KPIs, but they must be achieved to ensure the tROAS will be achieved in a timely manner.',
  'cost-per-acquisition (CPA) performance targets':
    'The cost might be hard to acuqire, but if successful, performance targets can be achieved.',
  'target impression share':
    'To maximize the share of targets, they can be made.',
  'maximize conversions vs maximize conversion value':
    'Unraid works well for this.',
  'native and non native inventory':
    'It helps to know the difference between native and native inventory and non native.',
};

function setupRemarketing() {
  let remarketingDataArray = Object.entries(REMARKETING_DATA);
  
  for (let remarketingDataEntry of remarketingDataArray) {
    let clone = remarketing_btn_template.content.cloneNode(true);
    clone.children[0].innerHTML = remarketingDataEntry[0];
    remarketing_btn_container.appendChild(clone);
  }
}
