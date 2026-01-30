import { decryptAes } from "./handleCrypto"

export const getAccess = (slug, parentSlug, permission) => {
  try {
    let res = false
    if (typeof slug == 'object') {
      let check = {};
      slug.map((e) => {
        check[e] = Boolean(permission.find(item => decryptAes(item.slug) == e));
      });

      if (Object.values(check).every(value => value === true)) {
        res = true;
      }
    } else {
      res = permission.find(item => decryptAes(item.slug) == slug)
    }

    if(parentSlug != null){
      // res = permission.find(item => decryptAes(item.slug) == slug && decryptAes(item.parent.slug) == parentSlug)
    }

    return Boolean(res)
  }catch(err){
    return false
  }
}