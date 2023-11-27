/*
 * Spring controller for the RPG government's social-credit feature. Keeps
 * track of how much the government likes a given player, and therefore of
 * which rights, amenities, privileges, etc, the player may have.
 */
package org.kirkiano.rpg.gov.social.credit;

import org.kirkiano.rpg.character.CharId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RequestMapping(path="/scs")
public class SocialCreditController {
    @Autowired
    private SocialCreditScoreRepository scsRepository;

    @PostMapping(path="/add")
    public @ResponseBody String addNewUser (
        @RequestParam Integer cid,
        @RequestParam(name="scs") Float scsF
    )
    {
        try {
            SocialCreditScore scs = SocialCreditScore.fromFloat(scsF);
            CharIdSocialCreditScore cidScs = scsRepository.findById(cid)
                .map(c -> {
                    c.setSocialCreditScore(scs);
                    return c;
                })
                .orElseGet(() -> {
                    CharIdSocialCreditScore c = new CharIdSocialCreditScore();
                    c.setCid(cid);
                    c.setSocialCreditScore(scs);
                    return c;
                });
            scsRepository.save(cidScs);
            return "Saved: " + cidScs;
        }
        catch (SocialCreditScore.Invalid e) {
            return "ERROR: " + e;
        }
    }

    @GetMapping(path="/all")
    public @ResponseBody Iterable<CharIdSocialCreditScore> getAllCharacters() {
        return scsRepository.findAll();
    }
}
