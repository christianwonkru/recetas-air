import { Check, Languages, Type, X } from 'lucide-react'
import { FONTS, LANGUAGES, useSettings } from './settings'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { language, font, setLanguage, setFont, t } = useSettings()
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal settings-modal" role="dialog" aria-modal="true">
    <header className="modal-header"><div><span className="eyebrow">{t('appearance')}</span><h2>{t('settings')}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('close')}><X /></button></header>
    <p className="intro">{t('settingsIntro')}</p>
    <section className="settings-section"><h3><Languages /> {t('language')}</h3><div className="language-grid">{LANGUAGES.map(item => <button className={language === item.code ? 'selected' : ''} onClick={() => setLanguage(item.code)} key={item.code}><span>{item.label}</span>{language === item.code && <Check />}</button>)}</div></section>
    <section className="settings-section"><h3><Type /> {t('typography')}</h3><div className="font-grid">{FONTS.map(item => <button className={font === item.id ? 'selected' : ''} style={{ fontFamily: item.value }} onClick={() => setFont(item.id)} key={item.id}><b>Aa</b><span>{item.label}</span>{font === item.id && <Check />}</button>)}</div></section>
    <footer className="modal-actions"><button className="primary" onClick={onClose}>{t('done')}</button></footer>
  </section></div>
}
